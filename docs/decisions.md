# Decisions and notes

**English** · [Español](decisions.es.md) · [Back to the README](../README.md)

The reasoning behind the app, for a reviewer who wants more than the [README](../README.md): how each decision was made, how the Figma design was read where it left room, what the API does that its documentation does not say, and what each test proves.

- [Toolchain](#toolchain)
- [Architecture in detail](#architecture-in-detail)
- [Data and API](#data-and-api)
- [State](#state)
- [UI and motion](#ui-and-motion)
- [Figma interpretation](#figma-interpretation)
- [Performance](#performance)
- [API quirks](#api-quirks)
- [Tests in detail](#tests-in-detail)
- [Accessibility](#accessibility)
- [SEO](#seo)

## Toolchain

pnpm 10.34.6 is the last pnpm major that runs on Node 18. `package.json` pins pnpm in `packageManager`, so Corepack (bundled with Node) provides that exact version with no global install. It also declares `"engines": { "node": ">=18.18.0 <19" }`, and `.npmrc` sets `engine-strict=true`, so installing on another Node major fails.

pnpm 10 skips dependency install scripts unless they are allowed: `pnpm.onlyBuiltDependencies` lists the three that prepare native binaries (`esbuild`, `sharp`, `unrs-resolver`).

## Architecture in detail

```
src/
  app/                  routes, and the composition roots: the only code that names an adapter
    providers.tsx       the browser's composition root: hands the cart its storage and its catalog
    api/products        Route Handler for the client-side search
    api/products/[id]   one phone for the cart check, so the API key stays on the server
    api/images          image proxy that normalizes product photos
  core/
    product/
      domain/           Product types, the ProductRepository port (well-formed phones, each id once), the "From" price rule
      application/      get-products: the first 20 phones, or every match of a search
      infrastructure/   api-product-repository: calls the API, validates, removes repeated ids, builds image URLs;
                        http-product-repository: the browser's way in, through our Route Handler
    cart/
      domain/           cart lines, total, reducer, the changes a catalog check can bring, CartRepository port
      application/      revalidate-cart: checks saved lines against the catalog
      infrastructure/   local-storage-cart-repository
  services/             technical clients that implement no port: API client and errors, server config, image normalization
  lib/                  pure helpers and UI hooks for the React side; the core never imports it
  context/cart/         React context that wires the cart to the repositories it receives as props
  components/           one kebab-case folder per component: component.tsx, .css, __tests__/
  styles/               variables.css (design tokens) and globals.css
e2e/                    Playwright specs, the fake API and its fixed catalog (fixtures/), and the
                        specs against the real API (contract/)
```

The catalog and the cart change for different reasons than the framework does, so each can evolve on its own: the browser already reaches the catalog through a second adapter (`http-product-repository`), a server-side cart or another API would be one more adapter, and both the use cases and the React layer are tested against plain fakes passed in as arguments or props, not against mocked module paths.

Tests live in `__tests__/` next to the code they cover, and shared fixtures in `__mocks__/`. Use cases, components and the cart context are tested with in-memory repositories, adapters with a stubbed API client or `fetch`, and the browser's composition root with the real `localStorage`.

Only the server talks to the API:

1. The list and detail pages are server components that hold `apiProductRepository`: the list runs the `get-products` use case with it, and the detail, which has no rule of its own, asks it for the phone. The cart lives in the browser and needs no API call to be shown.
2. The repository validates the API data, removes repeated ids and points images to our domain; a use case exists only where there is a business rule.
3. `apiClient` (`import 'server-only'`) is the one place that knows the API URL and key. It maps a 404 to "not found" and sets caching and timeouts.
4. In the browser, the search calls our Route Handler `/api/products`, which runs the same use case.
5. Product photos load from `/api/images/[file]`, which fetches the original from the API host and normalizes it.

## Data and API

- **The API key never reaches the browser.** Pages fetch on the server and the search goes through `/api/products`.
- **Security headers** on every response: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` and `Content-Security-Policy: frame-ancestors 'none'`. A full CSP is left out because Next's inline scripts would need `'unsafe-inline'`, which cancels its protection, or a nonce per request, which renders every page dynamically and drops the cached catalog. HSTS belongs to the HTTPS layer in front of the app, not to the app itself; the demo's Cloudflare does not enable it.
- **Node 18 end to end**, production included: the app runs on its own VPS because Vercel no longer offers Node 18. Tools are held to Node 18 compatible majors, with exact versions where it matters (Next 15.5.27, Playwright 1.61.1, vitest-axe 0.1.0).
- **Validated responses.** Type guards check the data at the boundary: a malformed phone is left out of a list, a malformed product shows the error page instead of a false "not found". A spec the API leaves out is not malformed data: the phone opens, and the specs table and the meta description leave that spec out.
- **One API call per product page.** The page and its metadata share the request through React `cache()`, so a slow or failing API is waited for once.
- **Prices follow the brief.** It asks for the "precio base" on each card, and for the "precio base y variaciones según almacenamiento" on the detail. Cards show `basePrice`, which is what the list endpoint returns. The detail opens with "From" and the cheapest storage price, as in Figma, then shows the price of the chosen storage. The two can differ: the API's `basePrice` is not always the cheapest storage (Galaxy S24 Ultra: 1329 EUR on the card, from 1229 EUR on the detail). Aligning them would take one detail request per card, so each view shows the price its endpoint provides.

## State

- **Cart with Context and `useReducer`.** Four actions (add, remove, restore and apply the catalog check) need no library.
- **One line per "Añadir"**, because Figma has no quantity control. A random id from `crypto.getRandomValues()`, which also works over plain HTTP, lets "Eliminar" remove exactly that line.
- **Stored cart read after mount and validated**, so server and first client render agree and edited or outdated data is ignored. The total is added in cents.
- **No cart count before the saved cart is read.** Until then the count is unknown, so the header shows no bag rather than a "0" that would be wrong for a cart with products, a state Figma never draws. The server HTML carries no count either.
- **One cart across tabs.** Every change is applied to the cart as saved at that moment, not to the copy a tab read earlier, so two tabs never overwrite each other; open tabs follow the saved cart, also when a page comes back from the back/forward cache. Only two writes within about a millisecond of each other could still collide. If the browser blocks storage, the cart lives in memory for the visit.
- **The saved cart is checked against the catalog when it opens.** It can be days old in `localStorage`, while the catalog belongs to an external API that changes on its own; this way a phone that is no longer sold or a new price shows up before paying, not after. Each phone is asked once through `/api/products/[id]`, which reads the catalog past the one-hour cache and sends its answer `no-store`, so the check sees today's price: a line whose phone, storage or color is no longer sold is removed, a line whose storage changed price gets the current one, and a short message says so. A phone that cannot be checked (network error, API down) is left as it is, so a failed request never empties a cart. Changes apply by line, so a line removed meanwhile stays removed.
- **A phone that left the catalog answers `null`, not 404**, from `/api/products/[id]`: it is an expected answer for the cart, and a 404 would print an error in the browser console.
- **Storage, color and search live in the URL**, so a configured phone or a search can be shared. `replaceState` keeps Back from undoing each choice. Since a search typed on the list never gets a server render of its own, the list starts over from each server render (so the home link always shows the full list), and Back or Forward between two searches asks the server for the list again.
- **Search retries without new UI.** A network error or a 5xx is retried once; pressing Enter repeats a failed search. Figma has no retry button.

## UI and motion

- **Plain CSS, BEM and tokens.** Every visual value lives once in `src/styles/variables.css`; breakpoints override the token, not each component.
- **Motion from the prototype.** Its springs become CSS `linear()` easings and duration tokens, run with CSS transitions and the Web Animations API on top of the live DOM. They never block a click, hover or keystroke, and `prefers-reduced-motion` turns them off.
- **Similar items**: a natively scrollable list that runs out to the right edge of the window, as the Figma carousel does. A mouse can drag the list itself or its decorative thumb, as in the prototype; touch keeps native scrolling.
- **"Añadir" opens the cart**, which dissolves in with the prototype's "Slow" spring.

## Figma interpretation

Ambiguous Figma points, and how each was resolved:

- Sizes come from the Design page; the Proto page is used for behaviour and motion. Some Proto frames sit a few pixels off the Design ones (search 51 px under the header instead of 60; "Specifications" 140 px under the add button instead of 154): the Design values are used.
- The colour swatches and names come from the API (`hexCode`, `name`). The Figma frames use sample colours and Spanish sample names ("Violeta Titanium") that do not match any product.
- A cart with several phones stacks them one below the other on every breakpoint; every cart frame shows a single phone.
- The mobile prototype's "FILTRAR" link is not implemented: it was never designed and the brief does not ask for it.
- The header bag is hidden on the cart page except on tablet, where the frames show it with or without products (an outline bag and "0" when the cart is empty).
- "Continue shopping" goes to the full list, as in the prototype.
- First load: the prototype goes from "Unloaded" (header only) to "Loading" (the black bar grows to full width), then reveals the list, with fixed delays standing in for the network. The app keeps the states and the springs but not the delays, since the real wait comes from the network: on a page load of the list, the header shows with the loading bar filling under it (a single element in the layout, so it never starts over) while the server prepares the list, and the moment the list is in the page it comes in with the reveal spring while the bar dissolves with it. With the catalog cached the list comes a few tens of milliseconds after the header, so the bar has barely started when it dissolves; a list that comes with the first paint shows no bar at all. This is a deliberate departure from the prototype's timing: replaying its 300 ms hold and the bar's full fill would keep a list that has already arrived hidden for 0.7 s to 0.9 s. Navigating back to the list inside the app shows it at once.
- The prototype cross-fades from a card straight into the detail. The app shows the loading bar only while the product is on its way, then the detail enters with the prototype's spring.

## Performance

- **Normalized product photos.** The API's photos are inconsistent: some have an opaque white background and the phone fills 60% to 100% of the frame. The right fix is a standardized source from the backend; until then `/api/images` normalizes them with sharp to the Figma framing (transparent background, phone at 73.2% of a square).
- **Each photo is downloaded at the size its slot needs.** `/api/images` resizes as it normalizes, to one of five widths (360, 520, 648, 832 and 1260 px, the largest being the 630 px desktop detail at 2x); small source photos are never enlarged. `next/image` asks for them through a custom loader, and each photo declares its on-screen size in `sizes`, so the browser picks the smallest sharp one. `sizes` cannot read CSS custom properties, so the four values live in `src/lib/product-image-sizes.ts` and a test recomputes them from the tokens: changing a card or photo size without them fails the test. The 20 list photos went from 1.16 MB to 203 kB at 1440 px on a 2x screen, 330 kB on a 2x phone.
- **The expensive part of a photo is done once, whatever the width.** Decoding the original, removing its white background and trimming it to the phone happen once per photo; each width is then only a resize and an encode. The background flood fill is synchronous JavaScript on the thread that renders pages, so it runs once per photo instead of once per width, and visits each pixel once. Serving the five widths of a cold photo went from a median of 375 ms to 277 ms one after another, and from 230 ms to 165 ms all at once.
- **Normalized images are kept in memory, one per width,** and sent as `immutable`, since their URLs carry a version. Any other width is rejected, so the cache stays bounded by the catalog (under 8 MB), next to the trimmed phones, kept as lossless PNG (about 32 MB for the 62 photos). For the same reason any CDN in front can keep them; on the demo, Cloudflare serves most of them from its edge.
- **The server is warmed up after a deploy.** Normalized photos are kept in the server's memory, so after a deploy the first visitor would wait for about 20 of them at once. `pnpm warm-up` (default `http://localhost:3000`) requests the list and each of its photos at every width its `srcset` offers, one at a time, and exits with an error if any request fails. With a CDN in front, running it against the public address also fills the CDN's cache.
- **The catalog is cached for an hour; searches and the cart check are not.** Each search term would become a new cache entry on disk, and the cart check must see a price that changed in the last hour. The cached and the live reading are two instances of the same adapter, chosen where each route is wired.
- **No prefetch on the cart link.** Prefetching `/cart` preloaded its stylesheet on every page, which Chrome reported as an unused preload.

## API quirks

| Problem                                                                       | How it is handled                                                                                                                                                              |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Repeated ids in the list and in similar products                              | 40 items are requested (the API holds 24) and duplicates removed; only the list without a search is cut to 20.                                                                 |
| Images served over `http` and inconsistent                                    | Proxied and normalized through `/api/images` on our domain.                                                                                                                    |
| `basePrice` differs from the storage prices                                   | Cards show `basePrice`, the detail the storage prices; see [Data and API](#data-and-api).                                                                                      |
| Unknown id answers 404 `NOT-FOUND`                                            | `apiClient` throws `NotFoundError`, and the page calls `notFound()`.                                                                                                           |
| Render free plan: the first request can take close to a minute                | 60 s timeout for page loads; a search gives the API 4 s and retries once, so it fails within seconds; the prototype's loading states, and a warm-up before the contract specs. |
| A product without one of its specs (the iPhone 13 has no `screenRefreshRate`) | Every spec is optional: the phone opens, and the specs table and the meta description leave that spec out.                                                                     |
| Responses not shaped as documented                                            | Type guards drop invalid items and turn an invalid product into an error.                                                                                                      |

## Tests in detail

The end-to-end suite runs against a fake API with a fixed catalog (`e2e/fake-api.mjs`), so a run never depends on the network and gives the same result every time. The catalog is a recording of the real one (`e2e/fixtures/catalog.json`): 24 entries with a repeated id, a search that finds more than 20 phones, a phone without one of its specs and storage prices below `basePrice`. The fake API draws the pictures, opaque white background included, so the image normalizer does its real work. The specs cover:

- catalog and search, a search that fails within seconds when the API is down, detail and add-to-cart, and the cart;
- the home link, which shows the full list again after a search, and Back, which brings the search back;
- the cart shared between two tabs, before and after a reload;
- a header that never shows a cart count other than the saved one, and none without JavaScript;
- an axe audit (WCAG 2.2 AA and best practices, contrast included) of eight screens at 393, 834 and 1920 px;
- the whole journey with the keyboard alone, from the search to removing the phone from the cart;
- the cart check against the catalog, with a clean console;
- the security headers on pages and on the search proxy;
- a check that fails on any console warning or error, or any unused stylesheet preload, on the list, a product, the cart and a 404;
- a phone for which the fake API is down, proving a product page asks the API once, and one whose price changes on every request, proving the cart check reads the catalog live.

First run: `pnpm exec playwright install chromium`. Ports 3151 and 3199 must be free; no `.env.local` is needed.

The contract specs (`pnpm test:e2e:contract`) run on the production build against the real API, with no phone, price or count written in them: every phone of the catalog opens its detail with its photo (the 20 of the list and the ones only "Similar items" links to, so a product the app cannot render fails here), a search by brand finds phones of that brand, and an unknown id shows the not-found page. They need `.env.local` and port 3150, and wake the API up first.

## Accessibility

- Storage and color are native radio groups in a `fieldset` with a `legend`: keyboard ready and announced as a group.
- The result count is an `aria-live` region; the cart link reads "3 products in the cart".
- After "Eliminar", focus moves to the cart title, which reads the new count.
- Spanish copy from Figma ("Añadir", "Eliminar") is marked `lang="es"` on an English page.
- Card pictures keep a descriptive `alt` for when they fail to load; the card link takes its name from the visible text only, so the phone is announced once.
- The message about cart changes is a `role="status"` region, present from the start so it is announced when it fills.
- Animations respect `prefers-reduced-motion`.
- Font sizes and line heights are Figma's pixel values written in `rem`, so text follows the size the reader sets in the browser; at the default setting the pages are pixel-identical to the px version, and at double size nothing clips or scrolls sideways.
- Two deliberate Figma choices: the search input has no outline, the text caret being its focus indicator (the "Input active" frame), and the placeholder keeps the design's grey.

## SEO

- The root layout sets a title template (`%s | MBST`, default "Smartphones | MBST") and a description.
- Each product page builds its title from brand and name, and its description from the "From" price, screen, processor and battery (`generateMetadata`).
- A search has its own title ("Results for “galaxy” | MBST"); search pages and the cart are `noindex, follow`.
- One `h1` per page (visually hidden on the list, where Figma shows no title), headings in order, `lang="en"`.
- Every indexable page names its canonical address: a product shared with `?storage=` and `?color=` points to `/product/[id]`.
- Shared links carry Open Graph and Twitter card data; a product adds its photo.
- `robots.txt` leaves the pages and the photos open and keeps crawlers out of the search proxy; `sitemap.xml` lists the catalog page and every phone, read from the API on request.
- Absolute addresses come from `SITE_URL`, set only on the deployed server, so a local run or CI never claims the public domain.
- The `X-Powered-By` header is off.
