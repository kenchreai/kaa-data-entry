<template>
  <section id="wrapper">
    <h1 class="section-heading">Kenchreai Data Editor</h1>
    <typeahead
      class="typeahead"
      :items="searchResults"
      :placeholder="'Search by keywords'"
      @selection="viewEntity($event)"
    >
    </typeahead>
    <a href="/generate-entity" v-if="loggedIn">Generate New Entity</a>
  </section>
</template>

<script>
import Typeahead from './Typeahead.vue'

import { bus } from './eventBus.js'

export default {
  data() {
    return {
      searchResults: [],
    }
  },
  components: {
    typeahead: Typeahead,
  },
  created() {
    this.loggedIn = Boolean(localStorage.getItem('access-token'))
    bus.$on('search results loaded', (val) => (this.searchResults = val))
  },
  methods: {
    viewEntity(url) {
      const shortUrl = url.replace('http://kenchreai.org/kaa/', '')
      this.$router.push(`/detail/${shortUrl}`)
    },
  },
}
</script>

<style scoped>
#wrapper {
  clear: both;
  margin: auto;
  max-width: 500px;
}

h1 {
  font-size: 4rem;
}

.typeahead {
  margin-bottom: 4rem;
}
</style>
