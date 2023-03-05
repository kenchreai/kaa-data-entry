<template>
  <section>
    <form id="login-form" action="">
      <input
        type="password"
        name="old-password"
        v-model="oldPassword"
        placeholder="Old Password"
      />
      <input
        type="password"
        name="new-password"
        v-model="newPassword"
        placeholder="New Password"
      />
      <input
        type="password"
        name="confirm-new-password"
        v-model="confirmNewPassword"
        placeholder="Confirm New Password"
      />
      <button
        class="button button-primary"
        :disabled="
          !oldPassword || !newPassword || !newPassword === confirmNewPassword
        "
        @click.prevent="resetPassword"
      >
        Reset Password
      </button>
    </form>
  </section>
</template>

<script>
import { bus } from "./eventBus.js";

const baseURL = "http://localhost:8080";

export default {
  data() {
    return {
      oldPassword: undefined,
      newPassword: undefined,
      confirmNewPassword: undefined,
    };
  },
  created() {
    bus.$on("redirected from detail", (url) => (this.redirectUrl = url));
  },
  methods: {
    resetPassword() {
      const { oldPassword, newPassword } = this;
      this.$http
        .put(`${baseURL}/api/users/password`, { oldPassword, newPassword })
        .then(
          (response) => {
            bus.$emit("toast-success", response.bodyText);
            this.$router.push("search");
          },
          (error) => {
            bus.$emit("toast-error", error.bodyText);
            console.log(error);
          }
        );
    },
  },
};
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
