import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,             // OBAVEZNO: Dozvoljava pristup van kontejnera
    port: 5173,
    strictPort: true,
    allowedHosts: ['flexfitfrontend.up.railway.app'] // Dodaj i ovde za svaki slučaj
  },
  preview: {
    host: true,             // OBAVEZNO
    port: 5173,
    strictPort: true,
    allowedHosts: ['flexfitfrontend.up.railway.app'] // Ovo je ono što ti Railway traži
  }
})