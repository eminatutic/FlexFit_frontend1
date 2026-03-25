export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Obavezno da bi Railway mogao da pristupi kontejneru
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 5173,
    allowedHosts: ['flexfit.up.railway.app'],
  }
})