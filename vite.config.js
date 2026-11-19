import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icono.svg'],
      manifest: {
        name: 'Medic · Formatos médicos',
        short_name: 'Medic',
        description: 'Recetas, constancias y certificados médicos',
        lang: 'es',
        theme_color: '#15606A',
        background_color: '#F4F5F2',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icono.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: { navigateFallback: '/index.html', maximumFileSizeToCacheInBytes: 4 * 1024 * 1024 }
    })
  ]
})
