import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { app, initDB, saveDB } from './server.js'; // Import the Express app and DB functions

// Custom Vite plugin to integrate Express backend
const expressPlugin = () => ({
  name: 'express-plugin',
  async configureServer(server) {
    // Initialize the database when the server starts
    await initDB().catch(err => {
      console.error("Failed to initialize database via Vite plugin:", err);
      process.exit(1);
    });

    // Mount the Express app as middleware
    server.middlewares.use(app);

    // Register graceful shutdown to save the database
    server.httpServer.on('close', () => {
      console.log('Vite server closing. Saving database...');
      saveDB();
    });
  },
});

export default defineConfig({
  plugins: [react(), expressPlugin()],
  server: {
    port: 3000, // Frontend will run on 3000
  },
});