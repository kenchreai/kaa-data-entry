import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'

export default defineConfig({
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm.js'
    }
  },
  plugins: [
    vue()
  ]
})
