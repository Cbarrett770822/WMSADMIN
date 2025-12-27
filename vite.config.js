import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    rollupOptions: {
      external: [
        'mongoose',
        'bcryptjs',
        'jsonwebtoken',
        '@mapbox/node-pre-gyp',
        'neon',
        'kerberos',
        'snappy',
        '@mongodb-js/zstd',
        'gcp-metadata',
        'socks',
        'aws4'
      ]
    }
  },
  optimizeDeps: {
    exclude: [
      'mongoose',
      'bcryptjs',
      'jsonwebtoken'
    ]
  }
})
