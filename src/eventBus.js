import Vue from 'vue'
import VueResource from 'vue-resource'

Vue.use(VueResource)

export const bus = new Vue({
  data: {
    uris: [],
    predicates: [],
    entities: [],
    uriProperties: [] // properties which are 'uri' type
  },
  methods: {
    loadPredicates () {
      this.$http.get('/api/descriptors').then((response) => {
        this.predicates = response.body.results.bindings
        this.$emit('predicates loaded', this.predicates)
      }, (error) => {
        this.$emit('toast-error', `Loading Predicates Failed: ${error.statusText}`)
      })
    },
    loadUris () {
      this.$http.get('/api/uris').then((response) => {
        this.uris = response.body.results.bindings.map(b => b.s.value)
        this.$emit('uris loaded', this.uris)
      }, (error) => {
        this.$emit('toast-error', `Loading URIs Failed: ${error.statusText}`)
      })
    },
    loadEntities () {
      let searchTerms = ['kcp', 'kth', 'ke']
      searchTerms.forEach(term  => {
        const url = `/api/entitylist?domain=${term}`
        this.$http.get(url).then((response) => {
          this.entities = this.entities.concat(
            response.body.results.bindings.map((result) => {
              return Object.keys(result).map(key => result[key].value).join()
            })
          )
          this.$emit('entities loaded', this.entities)
        }, (error) => {
          this.$emit('toast-error', `Loading domain ${term} failed: ${error.statusText}`)
        })
      })
    },
    loadPredicateURIs () {
      this.$http.get('/api/uriproperties').then((response) => {
        this.uriProperties = response.body.results.bindings.map(b => b.subject.value)
        this.$emit('URI properties loaded', this.uriProperties)
      }, (error) => {
          this.$emit('toast-error', `Loading URI properties failed: ${error.statusText}`)
      })
    }
  },
  created () {
    this.loadPredicates()
    this.loadUris()
    this.loadEntities()
    this.loadPredicateURIs()
  }
})

