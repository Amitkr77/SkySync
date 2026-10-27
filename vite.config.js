import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Expose WEATHER_* variables (e.g. WEATHER_API_KEY) to the app alongside the default VITE_*.
  // Anything exposed here ends up in the browser bundle, so never put server-only secrets under these prefixes.
  envPrefix: ['VITE_', 'WEATHER_'],
})
