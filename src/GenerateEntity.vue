<template>
  <section class="wrapper">
    <h1>Generate New Entity</h1>
    <label for="namespace">Namespace</label>
    <select id="namespace" v-model="namespace">
      <option value="">Select</option>
      <option value="ke/co">KE Coin</option>
      <option value="ke/ke">KE Inventoried Object</option>
      <option value="kth/kth">KTH Inventoried Object</option>
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
    <p
      v-if="
        namespace &&
        nextEntityNumber &&
        !validationMessage &&
        !entityExistsMessage
      "
    >
      New entity will exist at {{ entityURI }}
    </p>
    <p
      class="validation-message"
      v-if="validationMessage || entityExistsMessage"
    >
      {{ validationMessage }}
      {{ entityExistsMessage }}
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
      :disabled="
        !namespace || !nextEntityNumber || !!validationMessage || entityExists
      "
      @click.prevent="generateEntity"
    >
      Generate Entity
    </button>
    <p></p>
    <br />
    <p v-if="createdEntities.length">Recently Created</p>
    <div v-for="linkSet of createdEntities">
      <div>
        <a :href="linkSet.kaa" target="_blank">{{ linkSet.kaa }}</a>
      </div>
      <div>
        <a :href="linkSet.editor" target="_blank">{{ linkSet.editor }}</a>
      </div>
      <br />
    </div>
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
      entityExists: true,
      entityExistsMessage: '',
      createdEntities: [],
    }
  },
  computed: {
    entityURI: function () {
      return `http://kenchreai.org/kaa/${this.namespace}${this.nextEntityNumber}`
    },
    editorURI: function () {
      return `/detail/${this.namespace}${this.nextEntityNumber}`
    },
  },
  watch: {
    namespace: function () {
      this.seriesNumber = ''
      this.nextEntityNumber = ''
      this.getNextItemInNamespace()
      this.checkEntityDoesNotExist()
      this.validationMessage = ''
      this.entityExistsMessage = ''
    },
    nextEntityNumber: function () {
      if (!this.namespace || !this.nextEntityNumber)
        return (this.validationMessage = '')
      if ('ke/co ke/ke kth/kth'.includes(this.namespace)) {
        if (
          !this.nextEntityNumber.match(/^\d{4}(?!\d)\S*$/) ||
          this.nextEntityNumber.match(/[A-Z]/)
        ) {
          this.validationMessage =
            'Entity label must be four digits and optional text (e.g. 0021, 2942bis, 9428-a2)'
          /* } else if (this.namespace === 'ke/co') {
            if (!this.nextEntityNumber.match(/^\d{4}$/)) {
              this.validationMessage =
                'Entity number must be four digits (e.g. 0031, 0208)'
            }
        */
        } else this.validationMessage = ''
      }
      this.checkEntityDoesNotExist()
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
    async checkEntityDoesNotExist() {
      this.entityExists = true
      this.entityExistsMessage = ''
      if (!this.namespace || !this.nextEntityNumber || this.validationMessage)
        return
      const response = await this.$http.get(
        `${API_ROOT}/api/entities?resourceName=${
          this.namespace + this.nextEntityNumber
        }`
      )
      if (response.ok && !!response.body.results.bindings.length) {
        this.entityExistsMessage = 'Entity already exists'
      } else {
        this.entityExists = false
      }
    },
    async generateEntity() {
      const response = await this.$http.post(`${API_ROOT}/api/entities`, {
        entityURI: this.entityURI,
        entityType: this.namespace,
        entityLabel: this.nextEntityNumber,
      })
      if (response.ok) {
        this.createdEntities.push({
          kaa: this.entityURI,
          editor: this.editorURI,
        })
        bus.$emit('entityCreated')
      }
    },
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
