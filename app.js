const http = require('http');
const net = require('net');
const url = require('url');

const PORT = process.env.PORT || 8080;

const AUTH_HEADER = 'Basic ' + Buffer.from('pixelnomad:pixelnomad12').toString('base64');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Proxy server is running successfully!');
});

server.on('connect', (req, cltSocket, head) => {
    const sAuth = req.headers['proxy-authorization'];

    if (!sAuth || sAuth !== AUTH_HEADER) {
        cltSocket.write('HTTP/1.1 407 Proxy Authentication Required\r\n');
        cltSocket.write('Proxy-Authenticate: Basic realm="Proxy"\r\n');
        cltSocket.end();
        return;
    }

    const srvUrl = url.parse('http://' + req.url);
    const srvSocket = net.connect(srvUrl.port, srvUrl.hostname, () => {
        cltSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        srvSocket.write(head);
        srvSocket.pipe(cltSocket);
        cltSocket.pipe(srvSocket);
    });

    srvSocket.on('error', (err) => {
        cltSocket.end();
    });

    cltSocket.on('error', (err) => {
        srvSocket.end();
    });
});

server.listen(PORT, () => {
    console.log(`Proxy server listening on port ${PORT}`);
});
