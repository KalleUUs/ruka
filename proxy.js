// proxy.js
// Node.js Express server: serve static front-end, handle auth, and proxy other API calls

const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// 1. Enable CORS and preflight for all routes
app.use(cors());
app.options('*', cors());

// 2. Serve static files (ensure your index.html and assets live in 'public' folder)
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

// 3. Parse JSON bodies for auth endpoint
app.use(express.json());

// 4. Handle authentication server-side to avoid CORS/405
app.post('/api/TokenAuth/Authenticate', async (req, res) => {
  try {
    const response = await axios.post(
      'https://ebecoconnect.com/api/TokenAuth/Authenticate',
      req.body,
      { headers: { 'Content-Type': 'application/json' } }
    );
    return res.json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    return res.status(status).json({ error: err.message, details: err.response?.data });
  }
});

// 5. Proxy other API routes (floor heating endpoints)
app.use(
  '/api/services/app',
  createProxyMiddleware({
    target: 'https://ebecoconnect.com',
    changeOrigin: true,
    secure: true,
    pathRewrite: { '^/api/services/app': '/api/services/app' }
  })
);

// 6. SPA fallback: serve index.html for all other GET requests
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// 7. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
