import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import sharp from 'sharp';

const catalog = JSON.parse(
  readFileSync(new URL('./fixtures/catalog.json', import.meta.url), 'utf8'),
);
const fileOf = (imageUrl) => imageUrl.slice(imageUrl.lastIndexOf('/') + 1);
const colorOfImage = new Map(
  Object.values(catalog.details).flatMap((phone) =>
    phone.colorOptions.map(({ imageUrl, hexCode }) => [
      fileOf(imageUrl),
      hexCode,
    ]),
  ),
);

const hits = new Map();
// Answers to searches starting with "hold-" wait until the test releases them.
const held = new Map();
const released = new Set();
const pictures = new Map();

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}

// What the real photos give the app's normalizer to do: an opaque white background around a
// phone that does not fill the picture. The outline keeps a white phone apart from it.
function drawPicture(hexCode) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
    <rect width="600" height="600" fill="#ffffff"/>
    <rect x="190" y="70" width="220" height="460" rx="36" fill="${hexCode}" stroke="#1a1a1a" stroke-width="10"/>
  </svg>`;
  return sharp(Buffer.from(svg)).webp({ lossless: true }).toBuffer();
}

async function sendPicture(response, file) {
  const hexCode = colorOfImage.get(file);
  if (!hexCode) return sendNotFound(response);
  if (!pictures.has(file)) pictures.set(file, await drawPicture(hexCode));
  response.writeHead(200, { 'Content-Type': 'image/webp' });
  response.end(pictures.get(file));
}

function sendNotFound(response) {
  sendJson(response, 404, { error: 'NOT-FOUND', message: 'Product not found' });
}

// As the real API: by name or brand, repeated ids included, then `offset` and `limit`.
function searchCatalog(searchParams) {
  const search = (searchParams.get('search') ?? '').toLowerCase();
  const offset = Number(searchParams.get('offset') ?? 0);
  const limit = Number(searchParams.get('limit') ?? catalog.list.length);
  return catalog.list
    .filter(({ name, brand }) =>
      `${name} ${brand}`.toLowerCase().includes(search),
    )
    .slice(offset, offset + limit);
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

// Stands in for the products API with the catalog recorded in fixtures/catalog.json, and counts
// what the app asks. On top of the catalog: DOWN-* phones answer as an API that is down,
// PRICE-* phones change price on every request, "down-" searches fail as the API down and
// "hold-" searches wait for the test.
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
  if (pathname === '/products') {
    if (search.startsWith('down-')) {
      return sendJson(response, 503, { error: 'DOWN', message: 'Waking up' });
    }
    const answer = () => sendJson(response, 200, searchCatalog(searchParams));
    if (search.startsWith('hold-') && !released.has(search)) {
      held.set(search, answer);
      return;
    }
    return answer();
  }
  if (pathname.startsWith('/images/')) {
    return sendPicture(response, pathname.slice('/images/'.length));
  }

  const id = pathname.slice('/products/'.length);
  if (id.startsWith('DOWN-')) {
    return sendJson(response, 503, { error: 'DOWN', message: 'Waking up' });
  }
  if (id.startsWith('PRICE-')) {
    return sendJson(
      response,
      200,
      phoneWithChangingPrice(id, hits.get(pathname)),
    );
  }
  const phone = catalog.details[id];
  return phone ? sendJson(response, 200, phone) : sendNotFound(response);
}).listen(Number(process.argv[2]));
