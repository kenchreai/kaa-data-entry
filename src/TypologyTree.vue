<template>
  <div>
    <typology-branch
      :typologies="rootTypologies"
      :label="'All'"
    ></typology-branch>
  </div>
</template>

<script>
import { API_ROOT } from './constants.js'
import TypologyBranch from './TypologyBranch.vue'

export default {
  components: {
    typologyBranch: TypologyBranch,
  },
  data() {
    return {
      typologies: [],
      typologyTree: {},
    }
  },
  computed: {
    rootTypologies() {
      return Object.values(this.typologyTree)
    },
  },
  async created() {
    this.loadTypologies()
  },
  methods: {
    loadTypologies() {
      this.$http.get(`${API_ROOT}/api/typologies`).then((response) => {
        this.typologies = response.body.results.bindings.map((item) => ({
          uri: item.typology.value,
          label: item.label.value,
          parentUri: item.parent?.value,
          subTypologies: {},
        }))
        this.buildTypologyTree()
      })
    },
    getParentTypology(parentUri) {
      return this.typologies.find((typ) => typ.uri === parentUri)
    },
    buildTypologyTree() {
      for (const typology of this.typologies) {
        let parent = this.getParentTypology(typology.parentUri)

        if (parent?.label?.includes('generic')) {
          this.typologyTree[typology.uri] = typology
          continue
        }

        while (!!parent) {
          parent.subTypologies[typology.uri] = typology
          parent = this.getParentTypology(parent.parentUri)
        }
      }
      this.typologyTree = { ...this.typologyTree }
    },
  },
}
</script>
