
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/', createProxyMiddleware({
    target: 'https://example.com',
    changeOrigin: true,
    secure: false,
    onProxyRes: function (proxyRes, req, res) {
        proxyRes.headers['x-forwarded-host'] = req.headers['host'];
    }
}));

app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});
