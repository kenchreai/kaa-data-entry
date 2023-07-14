<template>
  <section class="wrapper">
    <h1>Generate New Entity</h1>
    <label for="namespace">Namespace</label>
    <select
      id="namespace"
      v-model="namespace"
      @contextmenu="handleContextClick"
    >
      <option value="">Select</option>
      <option value="ke/co">KE Coin</option>
      <option value="ke/ke">KE Inventoried Object</option>
      <option value="kth/kth">KTH Inventoried Object</option>
      <option value="kcp/ka">KCP Architecture</option>
      <option value="kcp/ka-anno">KCP Architecture (By Year)</option>
      <option value="kcp/ki">KCP Inscription</option>
      <option value="kcp/ki-anno">KCP Inscription (By Year)</option>
      <option value="kcp/kl">KCP Lamp</option>
      <option value="kcp/kl-anno">KCP Lamp (By Year)</option>
      <option value="kcp/km">KCP Miscellaneous</option>
      <option value="kcp/km-anno">KCP Miscellaneous (By Year)</option>
      <option value="kcp/kp">KCP Pottery</option>
      <option value="kcp/kp-anno">KCP Pottery (By Year)</option>
      <option value="kcp/ks">KCP Sculpture</option>
      <option value="kcp/ks-anno">KCP Sculpture (By Year)</option>
    </select>
    <div v-if="isByYear">
      <label for="entityYear">Entity Year</label>
      <input
        type="number"
        id="entityYear"
        name="entityYear"
        v-model="entityYear"
      />
    </div>
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
    <p v-if="namespace === 'any'">I hope you know what you're doing</p>
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
      isByYear: false,
      entityYear: '',
      nextEntityNumber: '',
      validationMessage: '',
      entityExists: true,
      entityExistsMessage: '',
      createdEntities: [],
    }
  },
  computed: {
    entityURI: function () {
      if (this.namespace === 'any') {
        return `http://kenchreai.org/kaa/${this.nextEntityNumber}`
      }
      if (!this.isByYear) {
        return `http://kenchreai.org/kaa/${this.namespace}${this.nextEntityNumber}`
      }
      return `http://kenchreai.org/kaa/${this.namespace.replace('-anno', '')}${
        this.entityYear
      }-${this.nextEntityNumber}`
    },
    editorURI: function () {
      if (this.namespace === 'any') {
        return `/detail/${this.nextEntityNumber}`
      }
      if (!this.isByYear) {
        return `/detail/${this.namespace}${this.nextEntityNumber}`
      }
      return `/detail/${this.namespace.replace('-anno', '')}${
        this.entityYear
      }-${this.nextEntityNumber}`
    },
  },
  watch: {
    namespace: function (namespace) {
      this.isByYear = namespace.includes('anno')
      this.entityYear = ''
      this.seriesNumber = ''
      this.nextEntityNumber = ''
      this.getNextItemInNamespace()
      this.checkEntityDoesNotExist()
      this.validationMessage = ''
      this.entityExistsMessage = ''
    },
    entityYear: function (year) {
      if (year.match(/^\d{4}$/)) {
        this.getNextItemInNamespace()
      }
    },
    nextEntityNumber: function (entityNumber) {
      if (!this.namespace || !entityNumber) return (this.validationMessage = '')
      if ('ke/co ke/ke kth/kth'.includes(this.namespace)) {
        if (
          !entityNumber.match(/^\d{4}(?!\d)\S*$/) ||
          entityNumber.match(/[A-Z]/)
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

      if (this.namespace.includes('kcp')) {
        if (!entityNumber.match(/^\d{3}(?!\d)\S*$/)) {
          this.validationMessage =
            'Entity label must be three digits and optional text (e.g. 001, 201bis, 042-b)'
        } else this.validationMessage = ''
      }

      this.checkEntityDoesNotExist()
    },
  },
  methods: {
    handleContextClick() {
      this.namespace = 'any'
    },
    async getNextItemInNamespace() {
      if (
        (this.namespace.includes('anno') && !this.entityYear) ||
        this.namespace === 'any'
      ) {
        return
      }
      const namespace = this.namespace.replace('-anno', '')
      const response = await this.$http.get(
        `${API_ROOT}/api/last-namespace-item?namespace=${namespace}${this.entityYear}`
      )
      if (response.ok) {
        const entity = response.body.results.bindings[0]
        if (!entity) return
        const [_, number] = entity.s.value.split(namespace)
        this.seriesNumber = number
      }
    },
    useNextSeriesNumber() {
      if (!this.seriesNumber.includes('-')) {
        this.nextEntityNumber = (+this.seriesNumber + 1).toString()
      } else if (this.isByYear) {
        this.nextEntityNumber = (
          +this.seriesNumber.split('-')[1] + 1
        ).toString()
      } else {
        this.nextEntityNumber = ''
      }
      if (this.namespace.includes('kcp')) {
        if (this.nextEntityNumber.length === 1) {
          this.nextEntityNumber = `00${this.nextEntityNumber}`
        }
        if (this.nextEntityNumber.length === 2) {
          this.nextEntityNumber = `0${this.nextEntityNumber}`
        }
      }
    },
    async checkEntityDoesNotExist() {
      this.entityExists = true
      this.entityExistsMessage = ''
      if (!this.namespace || !this.nextEntityNumber || this.validationMessage)
        return

      let query = ''
      if (!this.isByYear) {
        query = this.namespace + this.nextEntityNumber
      } else {
        query =
          this.namespace.replace('-anno', '') +
          this.entityYear +
          '-' +
          this.nextEntityNumber
      }
      if (this.namespace === 'any') {
        query = this.nextEntityNumber
      }

      const response = await this.$http.get(
        `${API_ROOT}/api/entities?resourceName=${query}`
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
