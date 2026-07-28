import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  // Permite publicar los HTML de acceso dentro de cualquier carpeta o dominio externo.
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        portal: resolve(import.meta.dirname, 'index.html'),
        administrativo: resolve(import.meta.dirname, 'administrativo.html'),
        operativo: resolve(import.meta.dirname, 'operativo.html'),
      },
    },
  },
  server: {
    host: true,   // expone en red local (muestra IP)
    port: 5173,
  },
})
