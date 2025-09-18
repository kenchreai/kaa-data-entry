<template>
  <tr>
    <td>{{ key }}</td>
    <td
      class="object-value"
      v-if="!editorOpened"
      v-bind:class="{ 'inline-image': isImage, 'no-mobile': !isMobile }"
    >
      <section>
        <section>
          <a v-if="isAWSLink" target="_blank" :href="awsUrl + value">
            <p>{{ value }}</p>
          </a>
          <a v-else-if="isHyperLink" target="_blank" :href="url">
            <p>{{ value }}</p>
          </a>
          <p v-else>{{ value }}</p>
        </section>
        <button
          class="button button-remove"
          v-if="loggedIn"
          @click="$emit('remove')"
        >
          X
        </button>
        <button
          class="button button-remove"
          v-if="loggedIn"
          @click="editorOpened = !editorOpened"
        >
          Edit
        </button>
      </section>
      <section v-if="isImage">
        <img alt="photo from the kenchreai archives" :src="awsUrl + value" />
        <button
          v-if="loggedIn"
          class="button"
          @click.prevent="regenerateThumbnail"
        >
          Regenerate thumbnail
        </button>
      </section>
    </td>
    <td v-if="editorOpened && loggedIn">
      <section class="inline-editor">
        <form>
          <section id="input-wrapper">
            <textarea
              v-if="isLongText"
              :class="{
                valid: editorValue && isValid,
                invalid: editorValue && !isValid,
              }"
              v-model="editorValue"
              placeholder="Text..."
            >
            </textarea>
            <input
              type="text"
              v-if="!isLongText && !isURIProperty"
              :class="{
                valid: editorValue && isValid,
                invalid: editorValue && !isValid,
              }"
              v-model="editorValue"
              placeholder="Value..."
            />
            <typeahead
              :uris="uris"
              @selection="updateModel($event)"
              :class="{
                valid: editorValue && isValid,
                invalid: editorValue && !isValid,
              }"
              :placeholder="'URI...'"
              v-if="!isLongText && isURIProperty"
            >
            </typeahead>
            <p class="invalid" v-if="errorMessage">{{ errorMessage }}</p>
          </section>
          <button
            class="button button-remove"
            @click.prevent="updatePredicateValue"
          >
            Save
          </button>
          <button
            class="button button-remove"
            @click.prevent="editorOpened = !editorOpened"
          >
            Cancel
          </button>
        </form>
      </section>
    </td>
  </tr>
</template>

<script>
import { bus } from './eventBus.js'
import Typeahead from './Typeahead.vue'
import { API_ROOT } from './constants.js'

const isMobile = !!navigator.userAgent.match(/(iPhone|iPad|Android|BlackBerry)/)

export default {
  props: [
    'keyValPair',
    'predicate',
    'predicateType',
    'types',
    'isLongText',
    'awsUrl',
    'resource',
    'uris',
    'validators',
    'loggedIn',
    'isURIProperty',
  ],
  components: {
    typeahead: Typeahead,
  },
  data() {
    return {
      key: '',
      value: '',
      editorValue: undefined,
      editorOpened: false,
      errorMessage: null,
      isMobile,
    }
  },
  created() {
    this.renderRow()
    this.editorValue = this.value
  },
  computed: {
    validatorType() {
      return `${this.predicateType}Error`
    },
    isImage() {
      return this.key === 'Photograph' || this.key === 'Drawing'
    },
    isHyperLink() {
      return (
        this.predicate && this.predicate.ptype.value.indexOf('Object') !== -1
      )
    },
    isAWSLink() {
      return Boolean(
        ['Photograph', 'Drawing', 'File'].find((r) => r === this.key)
      )
    },
    url() {
      if (this.isHyperLink) {
        if (this.value.search('kenchreai.org/kaa') === -1) {
          return `http://kenchreai.org/kaa/${this.value}`
        } else {
          return this.value
        }
      }
    },
    isValid() {
      const validator = this.validators[this.validatorType]

      if (validator) {
        this.errorMessage = validator(this.editorValue, this.uris)
        return !Boolean(this.errorMessage)
      } else {
        this.errorMessage = null
        return true
      }
    },
  },
  methods: {
    renderRow() {
      const kvp = this.keyValPair
      this.key = kvp.label.value ? kvp.label.value : kvp.p.value
      this.value = kvp.o.value
    },
    regenerateThumbnail() {
      const url = `${API_ROOT}/api/thumbs/regenerate`
      this.$http
        .post(url, { imageUrl: this.value, isDrawing: this.key === 'Drawing' })
        .then((response) => {
          if (response.ok) {
            bus.$emit('toast-success', 'Enqueued task')
          } else {
            bus.$emit('Failed to enqueue task')
          }
        })
    },
    updatePredicateValue() {
      if (this.isValid) {
        const url = `${API_ROOT}/api/entities/${this.resource}`
        const oldVal = this.types[this.predicateType](this.value)
        const newVal = this.types[this.predicateType](this.editorValue)
        const data = {
          predicate: this.predicate.s.value,
          oldVal: oldVal,
          newVal: newVal,
        }
        this.$http.put(url, data).then((response) => {
          if (response.ok) {
            this.value = this.editorValue
            this.editorOpened = false
            bus.$emit('toast-success', 'Updated predicate')
          }
        })
      }
    },
    updateModel(data) {
      this.editorValue = data
    },
  },
}
</script>

<style scoped>
.inline-image > section > img {
  max-width: 300px;
  display: block;
}

.object-value {
  width: 70%;
}

.object-value > * {
  display: inline-block;
}

.object-value p {
  margin-bottom: 0;
}

.object-value.no-mobile:hover {
  background: #f6f6f6;
}

.object-value.no-mobile .button-remove {
  display: none;
}

.object-value.no-mobile:hover .button-remove {
  display: inherit;
}

.object-value > section {
  width: 100%;
}

.object-value > section > section {
  max-width: 80%;
  display: inline-block;
}

.object-value > section > button,
.inline-editor button {
  display: inline-block;
  float: right;
  height: 24px;
  margin: 0;
  line-height: inherit;
  padding: 0 11px;
  margin-right: 5px;
}

.inline-editor textarea {
  width: 100%;
  min-height: 300px;
}

.inline-editor input {
  width: 100%;
}

.valid,
.valid:focus {
  border-color: green;
}

.invalid,
.invalid:focus {
  border-color: red;
}
</style>
