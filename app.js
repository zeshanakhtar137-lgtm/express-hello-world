const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/', createProxyMiddleware({
  target: 'http://ip-api.com',
  changeOrigin: true,
  secure: false,
  on: {
    proxyReq: (proxyReq, req, res) => {
      proxyReq.setHeader('x-forwarded-host', req.headers['host']);
    }
  }
}));

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
