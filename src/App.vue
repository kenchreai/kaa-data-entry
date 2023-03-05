<template>
  <section class="container">
    <vue-progress-bar></vue-progress-bar>
    <vue-toastr ref="toastr"></vue-toastr>
    <header>
      <section class="header--nav-links">
        <router-link to="/search">Search</router-link>
        <router-link to="/login" v-if="!loggedIn">Login</router-link>
        <a href="/login" @click="logout" v-if="loggedIn"> Logout </a>
        <router-link to="/reset-password" v-if="loggedIn">
          Reset Password
        </router-link>
        <router-link to="/register">Register</router-link>
      </section>
    </header>
    <router-view></router-view>
  </section>
</template>

<script>
import Toastr from "vue-toastr";
import "vue-toastr/src/vue-toastr.scss";

import { bus } from "./eventBus.js";

export default {
  name: "app",
  components: {
    "vue-toastr": Toastr,
  },
  data() {
    return { loggedIn: false };
  },
  created() {
    this.loggedIn = Boolean(localStorage.getItem("access-token"));
    bus.$on("login", () => {
      this.loggedIn = true;
      this.$refs.toastr.s("Logged in");
    });
    bus.$on("logout", () => (this.loggedIn = false));
    bus.$on("toast-success", (mes) => this.$refs.toastr.s(mes));
    bus.$on("toast-error", (mes) => this.$refs.toastr.e(mes));
    bus.$on("toast-warning", (mes) => this.$refs.toastr.w(mes));
  },
  methods: {
    logout() {
      localStorage.setItem("access-token", "");
      this.loggedIn = false;
    },
  },
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

a {
  color: #42b983;
}

.header--nav-links a {
  margin-left: 1em;
}

header > section {
  float: right;
  margin-right: 10px;
  height: 30px;
}

header {
  display: block;
}
</style>
