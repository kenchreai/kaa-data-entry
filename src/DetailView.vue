<template>
<section>
  <h1 class="section-heading" id="resource-title">
    <a :href="`http://kenchreai.org/kaa/${resource}`"
       id="resource-title"
       target="_blank">
      Details - {{resource}}
    </a>
  </h1>
  <section v-if="loadedEntity">
    <table id="attribute-list">
      <thead>
        <tr>
          <td><h6>Property</h6></td>
          <td><h6>Value</h6></td>
        </tr>
      </thead>
      <tbody v-if="entity">
        <predicate-row v-for="(keyValPair, index) in entity.results.bindings"
                       :key="keyValPair.o.value"
                       :predicate="findPredicate(keyValPair)"
                       :predicateType="getType(x => x.s.value === keyValPair.p.value)"
                       :isLongText="predicateIsLongText(keyValPair)"
                       :keyValPair="keyValPair"
                       :awsUrl="awsUrl"
                       :uris="uris"
                       :types="types"
                       :resource="resource"
                       :validators="validators"
                       :loggedIn="loggedIn"
                       @remove="removePredicateValue(index)">
        </predicate-row>
      </tbody>
    </table>
    <form v-if="loggedIn">
      <section id="input-wrapper">
        <section>
          <select v-model="newPredicate"
                  :disabled="entityLoading">
            <option v-for="predicate in predicates"
                    :value="predicate.s.value">
              {{predicate.label.value}}
            </option>
          </select>
          <button :disabled="entityLoading || !isValid"
                  class="button button-primary"
                  @click.prevent="addPredicateValue">
            Add
          </button>
        </section>
        <textarea v-if="isLongText"
                  :class="{ valid: newValue && isValid, invalid: newValue && !isValid }"
                  :disabled="entityLoading"
                  v-model="newValue"
                  placeholder="Text...">
        </textarea>
        <input type="text"
               :disabled="entityLoading"
               :class="{ valid: newValue && isValid, invalid: newValue && !isValid }"
               v-if="!isLongText && !(predicateType === 'uri')"
               v-model="newValue"
               placeholder="Value...">
        <typeahead :uris="uris"
                   :class="{ valid: newValue && isValid, invalid: newValue && !isValid }"
                   :placeholder="'URI...'"
                   @selection="updateModel($event)"
                   v-if="!isLongText && predicateType === 'uri'">
        </typeahead>
       </section>
    </form>
  </section>
</section>
</template>


<script>
import PredicateRow from './PredicateRow.vue'
import Typeahead from './Typeahead.vue'
import { bus } from './eventBus.js'
import types from './typeService.js'
import validators from './validators.js'

export default {
  components: {
    'predicate-row': PredicateRow,
    'typeahead': Typeahead
  },
  props: ['collection', 'inventoryNum'],
  data () {
    return {
      entityLoading: false,
      entity: null,
      newPredicate: 'http://kenchreai.org/kaa/ontology/associated-with-month',
      newValue: undefined,
      predicates: [],
      uris: [],
      awsUrl: 'http://kenchreai-archaeological-archive-files.s3-website-us-west-2.amazonaws.com/',
      types: types,
      validators: validators,
      loggedIn: false
    }
  },
  created () {
    this.loadEntity()
    this.loggedIn = Boolean(localStorage.getItem('access-token'))
    this.predicates = bus.predicates
    this.uris = bus.uris
    bus.$on('uris loaded', data => this.uris = data)
    bus.$on('predicates loaded', data => this.predicates = data)
  },
  watch: {
    '$route': 'loadEntity'
  },
  computed: {
    resource () {
      return `${this.collection}/${this.inventoryNum}`
    },
    loadedEntity () {
      return Boolean(this.entity)
    },
    isLongText () {
      const pred = this.predicates.find(p => p.s.value === this.newPredicate)
      return Boolean(pred && pred.longtext)
    },
    predicateType () {
      return this.getType(p => p.s.value === this.newPredicate)
    },
    isValid () {
      if (validators[this.predicateType])
        return validators[this.predicateType](this.newValue, this.uris)
    }
  },
  methods: {
    predicateIsLongText (keyValPair) {
      const pred = this.predicates.find(p => p.s.value === keyValPair.p.value)
      return Boolean(pred && pred.longtext)
    },
    updateModel (data) {
      this.newValue = data
    },
    loadEntity (func) {
      this.entityLoading = true
      const url = `/api/entities?resourceName=${this.resource}`
      this.$http.get(url).then(response => {
        this.entity = response.body
        this.entityLoading = false
        if (func && typeof func === 'function') func()
      })
    },
    getType (findExpression) {
      const pred = this.predicates.find(findExpression)
      if (pred) {
        if (pred.ptype.value.indexOf('Object') !== -1) {
          return 'uri'
        } else {
          return pred.range.value.slice(pred.range.value.indexOf('#') + 1)
        }
      }
    },
    findPredicate (keyVal) {
      const label = keyVal.label.value ? keyVal.label.value : keyVal.p.value
      return this.predicates.find(p => p.label.value === label)
    },
    addPredicateValue () {
      if (this.isValid) {
        const url = `/api/entities/${this.resource}`
        const val = this.types[this.predicateType](this.newValue)
        this.$http.post(url, { key: this.newPredicate, val }).then(response => {
          if (response.body.boolean) {
            this.loadEntity(() => {
              this.newValue = undefined
              bus.$emit('toast-success', 'Added predicate')
            })
          }
        })
      }
    },
    removePredicateValue (index) {
      const predicateValue = this.entity.results.bindings[index]
      const url = `/api/entities/${this.resource}`
      let ptype = this.getType(p => p.label.value === predicateValue.label.value)

      // removing this for time being as it was wrapping with < and >, messing up deletes
      // if (predicateValue.label.value === 'File') ptype = 'uri'
      const value = this.types[ptype](predicateValue.o.value)
      const query = `?key=${predicateValue.p.value}&value=${value}`
      this.$http.delete(url + query).then(response => {
        this.entity.results.bindings.splice(index, 1)
        bus.$emit('toast-warning', 'Removed predicate')
      }, error => {
        console.log(error.body)
      })
    }
  }
}
</script>


<style scoped>

#resource-title {
  text-decoration: none;
  clear: both;
}

thead > tr > td > h6 {
  text-transform: uppercase;
  font-size: 1.4rem;
  letter-spacing: .2rem;
  font-weight: 600;
}

table {
  width: 100%;
}

#add-btn {
  position: absolute;
  font-size: 74px;
  padding: 0 6px;
  right: 0%;
  bottom: 40px;
}

#typeahead {
  min-width: 363px;
}

form {
  width: 94%;
  margin: auto;
  background-color: #fafafa;
  padding: 20px;
  margin-bottom: 40px;
  margin-top: 80px;
}

#input-wrapper {
  width: 80%;
  margin: auto;
}

form input {
  width: 100%;
}

form button {
  float: right;
}

textarea {
  width: 100%;
  height: 200px;
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
