<template>
<section>
  <header>
    <section>
      <router-link to="/">Search</router-link>
      <router-link to="/login" v-if="!loggedIn">Login</router-link>
      <a href="#/login"
         @click="logout"
         v-if="loggedIn">
        Logout
      </a>
      <router-link to="/register">Register</router-link>
    </section>
  </header>
  <router-view></router-view>
</section>
</template>


<script>
import { bus }from './eventBus.js'

export default {
  name: 'app',
  data () {
    return { loggedIn: false }
  },
  created () {
    this.loggedIn = Boolean(localStorage.getItem('access-token'))
    bus.$on('login', () => this.loggedIn = true)
  },
  methods: {
    logout () {
      localStorage.setItem('access-token', '')
      this.loggedIn = false
    }
  }
}
</script>


<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

a { color: #42b983; }

header > section{
  float: right;
  margin-right: 10px;
  height: 30px;
}

header {
  display: block;
}
</style>
