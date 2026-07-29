const http = require('http');
const httpProxy = require('http-proxy');
const net = require('net');

const proxy = httpProxy.createProxyServer({});

const PROXY_USER = "pixelnomad";
const PROXY_PASS = "pixelnomad12";

const server = http.createServer((req, res) => {
    const authHeader = req.headers['proxy-authorization'];
    if (!authHeader) {
        res.setHeader('Proxy-Authenticate', 'Basic realm="Secure Proxy"');
        res.writeHead(407, { 'Content-Type': 'text/plain' });
        return res.end('Proxy Authentication Required');
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    if (auth[0] !== PROXY_USER || auth[1] !== PROXY_PASS) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        return res.end('Invalid Proxy Credentials');
    }

    proxy.web(req, res, { target: req.url }, (err) => {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Proxy Error: ' + err.message);
    });
});

server.on('connect', (req, socket, head) => {
    const parts = req.url.split(':');
    const targetHost = parts[0];
    const targetPort = parts[1] || 443;

    const proxySocket = net.connect(targetPort, targetHost, () => {
        socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        proxySocket.write(head);
        proxySocket.pipe(proxySocket);
        socket.pipe(socket);
    });

    proxySocket.on('error', (err) => {
        socket.end();
    });

    socket.on('error', (err) => {
        proxySocket.end();
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Professional Proxy Server running on port ${PORT}`);
});
