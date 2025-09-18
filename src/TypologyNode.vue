<template>
  <div class="cursor-inherit">
    <typology-branch
      :label="typology.label"
      :uri="typology.uri"
      :typologies="Object.values(typology.subTypologies)"
    ></typology-branch>
  </div>
</template>

<script>
export default {
  components: { typologyBranch: () => import('./TypologyBranch.vue') },
  props: ['typology'],
}
</script>

<style>
.cursor-inherit {
  cursor: default;
}
</style>
