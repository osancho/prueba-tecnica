import { createServer } from 'node:http';

const hits = new Map();

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}

// A phone whose only storage costs as many euros as times it was asked for: a price that
// changes on every request, so a test can tell a live answer from a cached one.
function phoneWithChangingPrice(id, price) {
  return {
    id,
    brand: 'Test',
    name: 'Changing price',
    basePrice: price,
    specs: {},
    colorOptions: [
      { name: 'Black', hexCode: '#000000', imageUrl: `/images/${id}.webp` },
    ],
    storageOptions: [{ capacity: '128 GB', price }],
    similarProducts: [],
  };
}

// Stands in for a products API that is down or still waking up, and counts what the app asks.
// The empty catalog answers, so Playwright can tell when the app has started, and so do the
// PRICE-* phones; everything else is down.
createServer((request, response) => {
  const { pathname } = new URL(request.url, `http://${request.headers.host}`);

  if (pathname === '/__hits') {
    return sendJson(response, 200, Object.fromEntries(hits));
  }

  hits.set(pathname, (hits.get(pathname) ?? 0) + 1);
  if (pathname === '/products') return sendJson(response, 200, []);
  if (pathname.startsWith('/products/PRICE-')) {
    const id = pathname.slice('/products/'.length);
    return sendJson(
      response,
      200,
      phoneWithChangingPrice(id, hits.get(pathname)),
    );
  }
  sendJson(response, 503, { error: 'DOWN', message: 'Waking up' });
}).listen(Number(process.argv[2]));
