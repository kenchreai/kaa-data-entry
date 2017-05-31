import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import VueProgressBar from 'vue-progressbar'
import VueResourceProgressBarInterceptor from 'vue-resource-progressbar-interceptor'

import App from './App.vue'
import DetailView from './DetailView.vue'
import ListView from './ListView.vue'
import LoginView from './LoginView.vue'
import RegisterView from './RegisterView.vue'

Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(VueProgressBar)
Vue.use(VueResourceProgressBarInterceptor)

Vue.http.interceptors.push(function(request, next) {
  request.headers.set('x-access-token', localStorage.getItem('access-token'))
  next()
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
      component: LoginView
    }, {
      path: 'register',
      component: RegisterView
    }]
}]

const router = new VueRouter({ routes })
const app = new Vue({ router }).$mount('#app')
