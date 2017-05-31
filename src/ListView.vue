<template>
<section id="wrapper">
  <section>
    <h1 class="section-heading">Kenchreai Data Editor</h1>
    <form id="entity-search-form">
      <section class="row">
        <input type="text"
               placeholder="KAA entity..."
               v-model="searchTerm">
        <button @click.prevent="load(searchTerm)"
                class="button button-primary">
          Search
        </button>
      </section>
    </form>
  </section>
  <section v-if="results.length">
    <section>
      <ul>
        <li v-for="result in results">
          <a :href="'/#/detail/' + shortenUrl(result)">{{result}}</a>
        </li>
      </ul>
    </section>
  </section>
</section>
</template>


<script>
export default {
  data () {
    return {
      results: [],
      searchTerm: ''
    }
  },
  methods: {
    load (searchTerm) {
      const url = `/api/entitylist?domain=${searchTerm}`
      this.$http.get(url).then(response => {
        this.results = response.body.results.bindings.map(r => {
          return Object.keys(r).map(k => r[k].value).join()
        })
      })
    },
    shortenUrl (url) {
      return url.replace('http://kenchreai.org/kaa/', '')
    }
  }
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

</style>
