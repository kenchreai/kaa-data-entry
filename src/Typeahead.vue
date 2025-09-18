<template>
  <div class="awesomplete">
    <input
      type="text"
      id="typeahead"
      :placeholder="placeholder"
      @change="searchTerm($event)"
      @keypress="handleKeypress($event)"
      @awesomplete-selectcomplete="selectItem($event)"
    />
  </div>
</template>

<script>
let awesomplete
import Awesomplete from 'awesomplete/awesomplete.min.js'
import { bus } from './eventBus.js'
import { API_ROOT } from './constants.js'

export default {
  props: ['items', 'placeholder'],
  data() {
    return {
      valid: false,
      selectedUri: undefined,
    }
  },
  watch: {
    uris: function (value) {
      if (awesomplete) {
        awesomplete.list = this.uris
      } else {
        awesomplete = null
        this.initialize()
      }
    },
  },
  methods: {
    initialize() {
      awesomplete = new Awesomplete(document.querySelector('#typeahead'), {
        list: this.items,
        maxItems: 25,
        filter: (text, input) => true,
      })
    },
    handleKeypress(ev) {
      if (ev.key === 'Enter') {
        ev.preventDefault()
        this.searchTerm(ev)
      }
    },
    selectItem(ev) {
      this.$emit('selection', ev.text.value)
    },
    searchTerm(ev) {
      const searchTerm = ev.currentTarget.value
      this.$http.get(`${API_ROOT}/api/search?terms=${searchTerm}`).then(
        (response) => {
          const searchResults = response.body.results.bindings.map(
            ({ entity, label }) => ({
              value: entity.value,
              label: `${label.value}<div><small>${entity.value}</small></div>`,
            })
          )
          bus.$emit('search results loaded', searchResults)
          awesomplete.list = searchResults
        },
        (error) => {
          bus.$emit(
            'toast-error',
            `Loading domain ${searchTerm} failed: ${error.statusText}`
          )
        }
      )
    },
  },
  mounted() {
    this.initialize()
  },
  destroyed() {
    awesomplete = null
  },
}
</script>

<style>
.awesomplete,
#typeahead {
  width: 100%;
  z-index: 5000;
}

.valid.awesomplete .awesomplete input#typeahead,
.valid.awesomplete .awesomplete input#typeahead:focus {
  border-color: green;
}

.invalid,
.invalid:focus {
  border-color: red;
}
</style>
