<template>
  <section>
    <form id="register-form" action="">
      <input type="text"
             name="username"
             v-model="username"
             placeholder="Username"/>
      <input type="password"
             name="password"
             v-model="password"
             placeholder="Password"/>
      <input type="password"
             name="confirm-password"
             v-model="confirmPassword"
             placeholder="Confirm password"/>
      <button class="button button-primary"
              :disabled="!username || !password || password !== confirmPassword"
              @click.prevent="register">Register</button>
    </form>
  </section>
</template>



<script>
  import { bus } from './eventBus.js'

  export default {
    data () {
      return {
        username: undefined,
        password: undefined,
        confirmPassword: undefined
      }
    },
    methods: {
      register () {
        const { username, password } = this
        this.$http.post('/api/users', { username, password }).then((response) => {
          localStorage.setItem('access-token', response.body)
          bus.$emit('login')
          this.$router.push('search')
        }, error => {
          console.log(error)
        })
      }
    }
  }
</script>



<style scoped>
section {
  min-width: 300px;
  margin: auto;
  clear: both;
}

form {
  padding-top: 160px;
}

input,
button.button-primary.button {
  display: block;
  min-width: 200px;
  margin: auto;
  margin-top: 15px;
}

button.button-primary.button {
  min-width: 120px;
}
</style>
