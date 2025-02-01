<template>
  <div class="ml-4 mb-2">
    <div :class="{ 'cursor-pointer': !!typologies.length }" class="mb-2">
      <span @click="expanded = !expanded">
        <span v-if="typologies.length">
          {{ expanded ? '-' : '+' }}
        </span>
        {{ label }}
        <span v-if="typologies.length">({{ typologies.length }})</span>
      </span>
      <a v-if="uri" target="_blank" :href="uri" class="ml-2">View on KAA</a>
    </div>
    <div v-if="expanded">
      <typology-node
        :key="typology.uri"
        :typology="typology"
        v-for="typology in typologies"
      ></typology-node>
    </div>
  </div>
</template>

<script>
export default {
  components: { 'typology-node': () => import('./TypologyNode.vue') },
  props: ['typologies', 'label', 'uri'],
  data() {
    return {
      expanded: false,
    }
  },
}
</script>

<style>
.ml-4 {
  margin-left: 4rem;
}
.ml-2 {
  margin-left: 2rem;
}
.mb-2 {
  margin-bottom: 2rem;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
