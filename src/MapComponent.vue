<template>
  <section id="map"></section>
</template>


<script>
const L = require('../node_modules/leaflet/dist/leaflet.js')

const tileLayer = L.tileLayer(
  'https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png',
  {
    maxZoom: 18,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
  })


export default {
  data () {
    return {
      map: null,
      features: [],
      layers: [{
        id:0,
        name: 'markerLayer',
        active: true,
        features: this.features
      }]
    }
  },
  methods: {
    initialize () {
      this.map = L.map('map')
                  .setView([37.8829530184844, 22.994623691774912], 17)
      tileLayer.addTo(this.map)

      // const componentRef = this

      this.map.on('click', (event) => {
        this.addMarker(event.latlng)
        // const p = L.geoJSON(point).addTo(componentRef.map)

        L.DomEvent.stopPropagation(event)
      })
    },
    addMarker (latlng) {
      const feature = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [latlng.lng, latlng.lat]
        }
      }
      const featureLayer = L.geoJSON(feature, {
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
          radius: 8,
          fillColor: '#ff7800',
          color: '#000',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        })
      })
      featureLayer.on('click', (event) => {
        event.layer.remove()
        L.DomEvent.stopPropagation(event)
      })
      featureLayer.addTo(this.map)
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
