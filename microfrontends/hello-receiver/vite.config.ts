import { defineConfig } from 'vite';

// hello-receiver is built in library mode: one JavaScript file that defines <hello-receiver>.
// Entando loads that file on the page; it does not use an index.html.
// index.html is only for local development ("npm run dev"), so the MFE can run on its own.
export default defineConfig({
  build: {
    outDir: 'dist', // "buildFolder": "dist" in entando.json
    lib: {
      entry: 'src/main.ts',
      name: 'helloReceiver',
      formats: ['iife'], // a plain script: it runs as soon as Entando adds it to the page
      fileName: () => 'hello-receiver.js',
    },
    // Files in public/ (our image) are copied to dist/ next to hello-receiver.js.
    copyPublicDir: true,
  },
});
