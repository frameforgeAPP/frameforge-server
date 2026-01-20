import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { readFileSync } from 'fs'

const packageJson = JSON.parse(readFileSync('./package.json'))

// https://vite.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version)
  },
  server: {
    host: true,
    https: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:8000',
        ws: true,
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [
    basicSsl(),
    react(),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   devOptions: {
    //     enabled: true
    //   },
    //   includeAssets: ['vite.svg'],
    //   manifest: {
    //     name: 'FPS MONITOR RR',
    //     short_name: 'FPS MONITOR RR',
    //     description: 'Real-time PC Hardware Monitor',
    //     theme_color: '#242424',
    //     background_color: '#242424',
    //     display: 'fullscreen',
    //     orientation: 'landscape',
    //     icons: [
    //       {
    //         src: 'pwa-192x192.png',
    //         sizes: '192x192',
    //         type: 'image/png'
    //       },
    //       {
    //         src: 'pwa-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png'
    //       }
    //     ]
    //   }
    // })
  ],
})
