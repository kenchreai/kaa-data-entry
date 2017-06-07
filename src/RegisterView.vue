<template>
  <section>
    <form id="register-form" action="">
      <input type="text" name="username" placeholder="Username"/>
      <input type="password" name="password" placeholder="Password"/>
      <input type="password" name="confirm-password" placeholder="Confirm password"/>
      <button class="button button-primary">Register</button>
    </form>
  </section>
</template>



<script>
  export default {
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
