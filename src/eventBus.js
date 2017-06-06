import Vue from 'vue'
import VueResource from 'vue-resource'

Vue.use(VueResource)

export const bus = new Vue({
  data: {
    uris: [],
    predicates: []
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
    }
  },
  created () {
    this.loadPredicates()
    this.loadUris()
  }
})

