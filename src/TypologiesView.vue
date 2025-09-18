<template>
  <div>
    <h1>Browse Typologies</h1>
    <typology-tree />
  </div>
</template>

<script>
import TypologyTree from './TypologyTree.vue'

export default {
  components: {
    typologyTree: TypologyTree,
  },
}
</script>
