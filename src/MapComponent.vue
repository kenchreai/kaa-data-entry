<template>
  <section>
    <section id="map"></section>
  </section>
</template>


<script>
import { bus }from './eventBus.js'
const L = require('../node_modules/leaflet/dist/leaflet.js')
require('../node_modules/leaflet-draw/dist/leaflet.draw.js')
require('../node_modules/leaflet-draw/dist/leaflet.draw.css')

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('../node_modules/leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('../node_modules/leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('../node_modules/leaflet/dist/images/marker-shadow.png'),
});


const tileLayer = L.tileLayer(
  'https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png',
  {
    maxZoom: 18,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
  }
)

export default {
  props: ['mapData', 'resource'],
  data () {
    return {
      map: null,
      geoJSONFeatures: [],
      featureGroup: null
    }
  },
  methods: {
    initialize () {
      const map = L.map('map')
                  .setView([37.8829530184844, 22.994623691774912], 17)

      tileLayer.addTo(map)

      const featureGroup = L.geoJSON(this.mapData).addTo(map)
      this.featureGroup = featureGroup

      if (true) {
        const drawControls = new L.Control.Draw({
          edit: { featureGroup }
        })
        map.addControl(drawControls)
        map.on('draw:created', this.updateGeoJSON)
        map.on('draw:edited', this.updateGeoJSON)
        map.on('draw:deleted', this.updateGeoJSON)
      }
    },
    updateGeoJSON (event) {
      if (event.type === 'draw:created') {
        this.featureGroup.addLayer(event.layer)
      }

      if (event.type === 'draw:deleted') {
        event.layers.eachLayer(layer => this.featureGroup.removeLayer(layer))
      }

      const geoJSONLayers = this.featureGroup.getLayers().map(l => l.toGeoJSON())
      const updatedGeoJSON = `'${JSON.stringify(geoJSONLayers)}'`
      const predicateType = 'kaaont:x-geojson'
      const url = `/api/entities/${this.resource}`
      const payload = {
        predicate: predicateType,
        data: updatedGeoJSON
      }

      this.$http.put(url, payload).then(() => {
        bus.$emit('toast-success', 'Updated Map')
      }, (error) => {
        bus.$emit('toast-error', `Error Saving Map: ${error.statusText}`)
      })
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
