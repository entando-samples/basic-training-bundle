import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// hello-receiver is built in library mode: one JavaScript file that defines <hello-receiver>.
// Entando loads that file on the page; index.html is only the local test page ("npm run dev").
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // React reads process.env.NODE_ENV, which does not exist in the browser: Vite writes the value in.
  define: { 'process.env.NODE_ENV': JSON.stringify(mode) },
  build: {
    lib: {
      entry: 'src/main.jsx',
      name: 'hello-receiver',
      formats: ['umd'], // a plain script, wrapped in a function: as in the Entando React tutorial
      fileName: () => 'hello-receiver.js',
    },
  },
}))
