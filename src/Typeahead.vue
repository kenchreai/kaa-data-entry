<template>
  <div class="awesomplete">
    <input type="text"
           id="typeahead"
           :placeholder="placeholder"
           @change="searchTerm($event)"
           @awesomplete-selectcomplete="validate($event)"/>
  </div>
</template>


<script>
let awesomplete;
const Awesomplete = require("../node_modules/awesomplete/awesomplete.min.js");
import { bus } from "./eventBus.js";

export default {
  props: ["uris", "placeholder"],
  data() {
    return {
      valid: false,
      selectedUri: undefined
    };
  },
  watch: {
    uris: function(value) {
      if (awesomplete) {
        awesomplete.list = this.uris;
      } else {
        awesomplete = null;
        this.initialize();
      }
    }
  },
  methods: {
    initialize() {
      awesomplete = new Awesomplete(document.querySelector("#typeahead"), {
        list: this.uris,
        maxItems: 25
      });
    },
    validate(ev) {
      this.valid = Boolean(this.uris.find(x => x === ev.text.value));
      if (this.valid) {
        this.$emit("selection", ev.text.value);
      }
    },
    searchTerm(ev) {
      const searchTerm = ev.currentTarget.value;
      this.$http.get(`/api/entitylist?domain=${searchTerm}`).then(
        response => {
          const entities = new Set();
          response.body.results.bindings.forEach(result => {
            Object.values(result).forEach(entity => entities.add(entity.value));
          });
          bus.$emit("entities loaded", Array.from(entities));
        },
        error => {
          bus.$emit(
            "toast-error",
            `Loading domain ${searchTerm} failed: ${error.statusText}`
          );
        }
      );
    }
  },
  mounted() {
    this.initialize();
  },
  destroyed() {
    awesomplete = null;
  }
};
</script>


<style>
.awesomplete,
#typeahead {
  width: 100%;
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
