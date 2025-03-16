import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Increase the warning threshold for chunk sizes (default is 500 kB)
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Split vendor libraries (e.g., React and React DOM) into a separate chunk
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
})
