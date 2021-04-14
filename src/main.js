import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import VueProgressBar from 'vue-progressbar'
import VueResourceProgressBarInterceptor from 'vue-resource-progressbar-interceptor'

import App from './App.vue'
import { bus } from './eventBus.js'
import DetailView from './DetailView.vue'
import ListView from './ListView.vue'
import LoginView from './LoginView.vue'
import RegisterView from './RegisterView.vue'
import ResetPasswordView from './ResetPasswordView.vue'

require('../dist/css/normalize.css')
require('../dist/css/skeleton.css')
require('../node_modules/awesomplete/awesomplete.css')
require('../node_modules/leaflet/dist/leaflet.css')

Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(VueProgressBar)
Vue.use(VueResourceProgressBarInterceptor)

Vue.http.interceptors.push((request, next) => {
  request.headers.set('x-access-token', localStorage.getItem('access-token'))
  next((response) => {
    if (response.status === 403) {
      localStorage.setItem('access-token', '')
      bus.$emit('logout')
      bus.$emit('toast-error', 'Login needed')
      this.$router.push('/login')
    }
  })
})

const routes = [{
  path: '/',
  component: App,
  redirect: '/search',
  children: [{
    path: 'search',
    component: ListView
  }, {
    path: 'detail/:collection/:inventoryNum',
    component: DetailView,
    props: true
  }, {
    path: 'login',
    component: LoginView,
    beforeEnter: (to, from, next) => {
      if (from.fullPath.substr(0, 7) === '/detail') {
        setTimeout(() => bus.$emit('redirected from detail', from.fullPath), 500)
      }
      next()
    },
  }, {
    path: 'register',
    component: RegisterView
  }, {
    path: 'reset-password',
    component: ResetPasswordView
  }]
}]

const router = new VueRouter({ routes, mode: 'history' })
const app = new Vue({ router }).$mount('#app')
