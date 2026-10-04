import { createServer } from 'node:http';

const hits = new Map();
// Answers to searches starting with "hold-" wait until the test releases them.
const held = new Map();
const released = new Set();

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
    description: 'A phone for tests.',
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
  const { pathname, searchParams } = new URL(
    request.url,
    `http://${request.headers.host}`,
  );
  const search = searchParams.get('search') ?? '';

  if (pathname === '/__hits') {
    return sendJson(response, 200, Object.fromEntries(hits));
  }
  if (pathname === '/__release') {
    released.add(search);
    held.get(search)?.();
    return sendJson(response, 200, {});
  }

  hits.set(pathname, (hits.get(pathname) ?? 0) + 1);
  if (
    pathname === '/products' &&
    search.startsWith('hold-') &&
    !released.has(search)
  ) {
    held.set(search, () => sendJson(response, 200, []));
    return;
  }
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
