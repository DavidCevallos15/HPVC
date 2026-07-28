import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/admin/',   // 👈 ¡ESTA LÍNEA ES LA MAGIA CRÍTICA PARA PRODUCCIÓN!
  server: {
    host: true,   // expone en red local (muestra IP)
    port: 5174,
  },
})
