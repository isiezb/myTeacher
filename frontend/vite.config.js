import { defineConfig } from 'vite';

export default defineConfig({
  // Base public path when served in production (can be relative or absolute)
  base: './',
  // Configure server options
  server: {
    port: 5173, // Default Vite port
    open: true, // Automatically open browser
    // Proxy API requests to the backend during development
    // Assumes backend runs on port 8000
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Your backend server address
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false, // Allow self-signed certs if backend uses https locally
        // rewrite: (path) => path.replace(/^\/api/, '') // Uncomment if backend doesn't expect /api prefix
      },
    },
  },
  // Build options
  build: {
    outDir: '../backend/app/static', // Output built files to backend's static folder
    emptyOutDir: true, // Clear the output directory before building
    sourcemap: true, // Generate source maps for debugging production builds
  },
  // Resolve options (optional, for aliases etc.)
  resolve: {
    alias: {
      // Example: '@components': path.resolve(__dirname, 'src/components'),
    },
  },
  // Optimize dependencies (optional)
  optimizeDeps: {
    include: ['lit'],
  },
});
