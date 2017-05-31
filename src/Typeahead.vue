<template>
  <div class="awesomplete">
    <input type="text"
           id="typeahead"
           placeholder="URI..."
           @awesomplete-selectcomplete="validate($event)"/>
  </div>
</template>


<script>
  let awesomplete

  export default {
    props: ['uris'],
    data () {
      return {
        valid: false,
        selectedUri: undefined
      }
    },
    methods: {
      initialize () {
        awesomplete = new Awesomplete(document.querySelector('#typeahead'), {
          list: this.uris,
          maxItems: 25
        })
      },
      validate (ev) {
        this.valid = Boolean(this.uris.find(x => x === ev.text.value))
        if (this.valid) {
          this.$emit('selection', ev.text.value)
        }
      }
    },
    mounted () {
      setTimeout(() => this.initialize(), 400)
    },
    destroyed () { awesomplete = null }
  }
</script>


<style>
  .awesomplete, #typeahead {
    width: 100%;
  }
</style>
