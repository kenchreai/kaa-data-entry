import Vue from 'vue'
import VueResource from 'vue-resource'

Vue.use(VueResource)

export const bus = new Vue({
  data: {
    uris: [],
    predicates: [],
    entities: []
  },
  methods: {
    loadPredicates () {
      this.$http.get('/api/descriptors').then(response => {
        this.predicates = response.body.results.bindings
        this.$emit('predicates loaded', this.predicates)
      })
    },
    loadUris () {
      this.$http.get('/api/uris').then(response => {
        this.uris = response.body.results.bindings.map(b => b.s.value)
        this.$emit('uris loaded', this.uris)
      })
    },
    loadEntities () {
      let searchTerms = ['kcp', 'kth']
      searchTerms.forEach(term  => {
        const url = `/api/entitylist?domain=${term}`
        this.$http.get(url).then(response => {
          this.entities = this.entities.concat(
            response.body.results.bindings.map(r => {
              return Object.keys(r).map(k => r[k].value).join()
            })
          )
          this.$emit('entities loaded', this.entities)
        })
      })
    }
  },
  created () {
    this.loadPredicates()
    this.loadUris()
    this.loadEntities()
  }
})

