// proxy.js
// Node.js Express proxy to forward requests to EbecoConnect API and avoid CORS/500 errors

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Proxy any request starting with /api to the EbecoConnect server
app.use(
  '/api',
  createProxyMiddleware({
    target: 'https://ebecoconnect.com',
    changeOrigin: true,
    secure: true,
    pathRewrite: {
      '^/api': '/api'
    },
    onProxyReq: (proxyReq, req, res) => {
      // If you need to inject headers (e.g. authentication) here, do it
      // proxyReq.setHeader('Authorization', 'Bearer <token>');
    }
  })
);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
