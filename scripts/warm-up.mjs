// Run after `pnpm start` so the first visitor does not pay for a cold server: loading the list
// fetches and caches the catalog, then every photo it shows is normalized at each width its
// srcset offers. Usage: pnpm warm-up [base URL], http://localhost:3000 by default.
const baseUrl = process.argv[2] ?? 'http://localhost:3000';

async function get(path) {
  const response = await fetch(new URL(path, baseUrl));
  if (!response.ok) throw new Error(`${path} answered ${response.status}`);
  return response;
}

const listHtml = await (await get('/')).text();
const photoUrls = new Set(
  [...listHtml.matchAll(/srcSet="([^"]+)"/g)].flatMap(([, srcSet]) =>
    srcSet
      .replaceAll('&amp;', '&')
      .split(', ')
      .map((candidate) => candidate.split(' ')[0]),
  ),
);
if (photoUrls.size === 0) throw new Error('The list shows no photos');

// One at a time: a burst of normalizations is exactly the load this script spares visitors.
for (const url of photoUrls) {
  await (await get(url)).arrayBuffer();
}
console.log(`Warmed up the catalog and ${photoUrls.size} photos at ${baseUrl}`);
