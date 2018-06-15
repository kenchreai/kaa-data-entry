<template>
  <section>
    <button @click="openEditing"
            v-if="!editing">
      Edit
    </button>
    <button @click="cancelEditing"
            v-if="editing">
      Cancel
    </button>
    <form v-if="editing">
      <label for="editing-mode">Mode</label>
      <select v-model="editingMode" id="editing-mode">
        <option value="markers">Markers</option>
        <option value="polygons">Polygons</option>
      </select>
      <label for="feature-label">Feature Label</label>
      <input id="feature-label" v-model="featureLabel" type="text" />
      <section v-if="editingMode==='polygons'">
        <label for="polygon-list">Select Feature</label>
        <select id="polygon-list">
          <option v-for=""></option>
        </select>
      </section>
      
      <button @click.prevent="save" type="submit">Save</button>
    </form>
    <section id="map"></section>
  </section>
</template>


<script>
const L = require('../node_modules/leaflet/dist/leaflet.js')

const tileLayer = L.tileLayer(
  'https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png',
  {
    maxZoom: 18,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
  })
const markerConfig = {
  radius: 8,
  fillColor: '#ff7800',
  color: '#000',
  weight: 1,
  opacity: 1,
  fillOpacity: 0.8
}

export default {
  data () {
    return {
      map: null,
      layers: [],
      layerEdits: [],
      editing: false,
      editingMode: 'markers', // either 'markers' or 'polygons'
      featureLabel: ''
    }
  },
  methods: {
    initialize () {
      this.map = L.map('map')
                  .setView([37.8829530184844, 22.994623691774912], 17)
      tileLayer.addTo(this.map)
      const mapComponent = this

      this.map.on('dblclick', (event) => {
        if (mapComponent.editing) {
          switch (mapComponent.editingMode) {
              case 'markers': mapComponent.addMarker(event.latlng)
              case 'polygons': mapComponent.addPolygonPoint(event.latlng)
          }
          L.DomEvent.stopPropagation(event)
        }
      })
    },
    openEditing () {
      this.layerEdits = [...this.layers]
      this.editing = true
      this.map.doubleClickZoom.disable()
    },
    cancelEditing () {
      this.layerEdits = []
      this.editing = false
      this.map.doubleClickZoom.enable()
    },
    addMarker (latlng) {
      const feature = {
        type: 'Feature',
        properties: {
          label: ''
        },
        geometry: {
          type: 'Point',
          coordinates: [latlng.lng, latlng.lat]
        }
      }
      const featureLayer = L.geoJSON(feature, {
        pointToLayer: (feature, latlng) => L.circleMarker(
          latlng, markerConfig
        )
      })
      featureLayer.on('dblclick', (event) => {
        if (this.editing) {
          event.layer.remove()
          L.DomEvent.stopPropagation(event)
        }
      })
      featureLayer.addTo(this.map)
      this.layerEdits.push(featureLayer)
    },
    addPolygonPoint (latlng) {
      const feature = {}
    },
    save () {

    }
  },
  mounted () { this.initialize() }
}


</script>


<style scoped>

#map {
  height: 600px;
}

</style>
