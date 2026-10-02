import { createServer } from 'node:http';

const hits = new Map();

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}

// Stands in for a products API that is down or still waking up, and counts what the app asks.
// Only the empty catalog answers, so Playwright can tell when the app has started.
createServer((request, response) => {
  const { pathname } = new URL(request.url, `http://${request.headers.host}`);

  if (pathname === '/__hits') {
    return sendJson(response, 200, Object.fromEntries(hits));
  }

  hits.set(pathname, (hits.get(pathname) ?? 0) + 1);
  if (pathname === '/products') return sendJson(response, 200, []);
  sendJson(response, 503, { error: 'DOWN', message: 'Waking up' });
}).listen(Number(process.argv[2]));
