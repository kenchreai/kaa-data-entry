<template>
<section id="wrapper">
  <h1 class="section-heading">Kenchreai Data Editor</h1>
  <typeahead :uris="entities"
             :placeholder="'KAA entity...'"
             @selection="viewEntity($event)">
  </typeahead>
</section>
</template>


<script>
import Typeahead from "./Typeahead.vue";

import { bus } from "./eventBus.js";

export default {
  data() {
    return {
      entities: bus.entities
    };
  },
  components: {
    typeahead: Typeahead
  },
  created() {
    bus.$on("entities loaded", val => (this.entities = val));
  },
  methods: {
    viewEntity(url) {
      const shortUrl = url.replace("http://kenchreai.org/kaa/", "");
      this.$router.push(`/detail/${shortUrl}`);
    }
  }
};
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
