/**
 * Simple Express server for the Educational Stories application
 */

console.log("--- Backend Server Starting --- [server.js]"); // Add startup log

const express = require('express');
const path = require('path');
const app = express();

// Use Render's PORT environment variable or default to 10000 for compatibility
const PORT = process.env.PORT || 10000;
console.log(`--- Using Port: ${PORT} ---`); // Log the port being used

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle all GET routes - redirect to index.html
// This prevents API POST/GET calls from being handled here
app.get('*', (req, res) => {
  // Only serve index.html if it's not an API-like path
  if (!req.path.startsWith('/api/') && !req.path.startsWith('/stories')) {
    console.log(`Serving index.html for path: ${req.path}`);
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    // For API-like paths, let them 404 if not handled elsewhere (or handled by a different server)
    console.log(`API-like path requested, letting it pass: ${req.path}`);
    res.status(404).send('Not Found');
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => { // Ensure it binds to 0.0.0.0
  console.log(`--- Server successfully listening on port ${PORT} ---`);
  console.log(`Open http://localhost:${PORT} in your browser (if running locally)`);
}); 