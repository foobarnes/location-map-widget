import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.tsx'),
      name: 'OpenMapEmbed',
      fileName: (format) => `open-map-embed.${format}.js`,
      formats: ['umd', 'es']
    },
    rollupOptions: {
      // Bundle everything including React to make it truly standalone
      external: [],
      output: {
        globals: {},
        // Ensure styles are inlined
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'open-map-embed.css';
          return assetInfo.name as string;
        }
      }
    },
    cssCodeSplit: false, // Bundle all CSS into single file
    minify: 'terser', // Use terser for better minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    },
    sourcemap: true, // Generate sourcemaps for debugging
  },
  define: {
    // Ensure process.env is defined for libraries that expect it
    'process.env': {}
  },
  server: {
    allowedHosts: ['rootnote.ngrok.dev'],
  }
})
