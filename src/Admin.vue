<template>
  <section id="wrapper" v-if="isAdmin">
    <h1 class="section-heading">Admin</h1>
    <div class="function-section">
      <h2>Zotero</h2>
      <div class="function-wrapper">
        <button @click="triggerSync">Update Zotero Cache</button>
        <p>
          Run this after items in the online Zotero bibliography have been
          updated. It may take a few minutes to run; up to 20 new Zotero items
          will be added per sync
        </p>
      </div>
    </div>
  </section>
</template>

<script>
import { bus } from './eventBus.js'
import { API_ROOT } from './constants.js'

export default {
  data() {
    return {
      isAdmin: false,
    }
  },
  created() {
    const token = localStorage.getItem('access-token')
    if (token) {
      this.isAdmin = JSON.parse(atob(token.split('.')[1])).isAdmin
    }
  },
  methods: {
    triggerSync() {
      this.$http.post(`${API_ROOT}/api/zotero/refresh`, {}).then((response) => {
        if (response.ok) {
          bus.$emit('toast-success', 'Triggered sync process with Zotero')
        } else {
          bus.$emit('toast-error', 'Failed to trigger Zotero sync')
        }
      })
    },
  },
}
</script>

<style scoped>
#wrapper {
  clear: both;
  margin: auto;
  max-width: 900px;
}

h1 {
  font-size: 4rem;
}

h2 {
  font-size: 3rem;
}

.function-section {
  margin-top: 6rem;
  margin-left: 3rem;
}

.function-wrapper {
  display: flex;
  justify-content: space-between;

  p {
    max-width: 600px;
  }
}
</style>
