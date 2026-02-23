const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const httpProxy = require('http-proxy');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Escuchar en todas las interfaces
const port = parseInt(process.env.PORT, 10) || 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Configuración del Proxy (Apuntamos a la LAN/Localhost de OpenClaw)
const OPENCLAW_TARGET = process.env.OPENCLAW_INTERNAL_URL || 'http://127.0.0.1:18789';

const proxy = httpProxy.createProxyServer({
  target: OPENCLAW_TARGET,
  changeOrigin: true,
  ws: true // Habilitar soporte de WebSockets
});

// Manejo de errores del proxy
proxy.on('error', (err, req, res) => {
  console.error('[Proxy Error]:', err.message);
  if (res.writeHead) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Something went wrong in the proxy bridge.');
  }
});

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    // 1. Interceptar llamadas REST a la API de OpenClaw
    // Redirigimos /api/v1/* directamente al servidor interno de OpenClaw
    if (pathname.startsWith('/api/v1') && !pathname.includes('stream')) {
      return proxy.web(req, res);
    }

    // 2. Por defecto, dejar que Next.js maneje la petición
    handle(req, res, parsedUrl);
  });

  // 3. Interceptar y Puente de WebSockets (Crucial para el Firehose)
  server.on('upgrade', (req, socket, head) => {
    const { pathname } = parse(req.url);
    
    // Si la petición es al stream de OpenClaw, la puenteamos
    if (pathname.startsWith('/api/v1/stream')) {
      console.log('[Proxy] Upgrading WebSocket connection to OpenClaw');
      return proxy.ws(req, socket, head);
    }
    
    // De lo contrario, dejar que el servidor de Next.js lo maneje si es necesario (ej. HMR en dev)
    // Pero solo si no es el stream de OpenClaw
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Proxying /api/v1 to ${OPENCLAW_TARGET}`);
  });
});
