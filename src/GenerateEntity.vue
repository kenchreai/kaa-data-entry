<template>
  <section class="wrapper">
    <h1>Generate New Entity</h1>
    <label for="namespace">Namespace</label>
    <select id="namespace" v-model="namespace">
      <option value="">Select</option>
      <option value="kth/kth">KTH entity</option>
      <option value="ke/co">KE Coin</option>
      <option value="kcp/ka">KCP Architecture</option>
      <option value="kcp/ki">KCP Inscription</option>
      <option value="kcp/kl">KCP Lamp</option>
      <option value="kcp/km">KCP Material</option>
      <option value="kcp/kp">KCP Pottery</option>
      <option value="kcp/ks">KCP Sculpture</option>
    </select>
    <label for="entityNumber">Entity Number</label>
    <input
      type="text"
      id="entityNumber"
      name="entityNumber"
      v-model="nextEntityNumber"
    />
    <p v-if="nextEntityNumber && !validationMessage">
      New entity will exist at http://kencheai.org/kaa/{{ namespace
      }}{{ nextEntityNumber }}
    </p>
    <p class="validation-message" v-if="validationMessage">
      {{ validationMessage }}
    </p>
    <br />
    <button
      v-if="seriesNumber && namespace"
      @click.prevent="useNextSeriesNumber"
    >
      Generate next number
    </button>
    <br />
    <button
      class="button button-primary"
      :disabled="!nextEntityNumber && !validationMessage"
      @click.prevent="generateEntity"
    >
      Generate Entity
    </button>
  </section>
</template>

<script>
import { bus } from './eventBus.js'
import { API_ROOT } from './constants.js'

export default {
  data() {
    return {
      namespace: '',
      seriesNumber: '',
      nextEntityNumber: '',
      validationMessage: '',
    }
  },
  watch: {
    namespace: function () {
      this.getNextItemInNamespace()
    },
    nextEntityNumber: function () {
      if (this.namespace === 'ke/co') {
        if (!this.nextEntityNumber.match(/^\d{4}$/)) {
          return (this.validationMessage =
            'Entity number must be four digits (e.g. 0031, 0208)')
        }
      }
      this.validationMessage = ''
    },
  },
  methods: {
    async getNextItemInNamespace() {
      const { namespace } = this
      const response = await this.$http.get(
        `${API_ROOT}/api/last-namespace-item?namespace=${namespace}`
      )
      if (response.ok) {
        const entity = response.body.results.bindings[0]
        const [_, number] = entity.s.value.split(this.namespace)
        this.seriesNumber = number
      }
    },
    useNextSeriesNumber() {
      if (!this.seriesNumber.includes('-')) {
        this.nextEntityNumber = (+this.seriesNumber + 1).toString()
      } else {
        this.nextEntityNumber = ''
      }
    },
    generateEntity() {},
  },
}
</script>

<style scoped>
.wrapper {
  padding-top: 160px;
  margin: auto;
  max-width: 26rem;
}

.validation-message {
  color: red;
}

button {
  margin-top: 1rem;
}
</style>
