import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base ("./") so the build works on any GitHub Pages URL
// (https://<user>.github.io/<repo>/) without needing to hard-code the repo name.
// Override with VITE_BASE if you deploy to a custom domain at the root.
// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE ?? './',
  plugins: [react()],
})
