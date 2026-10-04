# MBST — Smartphones

**English** · [Español](README.es.md)

A smartphone store built with Next.js 15 and React 19: browse and search the catalog, configure a phone and keep a cart.

- **List** (`/`): the first 20 phones, a live search that lists every match with its count, and the search kept in the URL.
- **Detail** (`/product/[id]`): photo per color, storage and color selectors with the price updating as you choose, specs and similar phones.
- **Cart** (`/cart`): one line per added phone, removal, total and an empty state.

**Live demo:** <https://zara.oscarsancho.dev>

| List                                                        | Detail                                                          | Cart                                                  |
| ----------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------- |
| ![Phone list on desktop](docs/screenshots/list-desktop.png) | ![Phone detail on desktop](docs/screenshots/detail-desktop.png) | ![Cart on desktop](docs/screenshots/cart-desktop.png) |
| ![Phone list on mobile](docs/screenshots/list-mobile.png)   | ![Phone detail on mobile](docs/screenshots/detail-mobile.png)   | ![Cart on mobile](docs/screenshots/cart-mobile.png)   |

Search results: [desktop](docs/screenshots/search-desktop.png), [mobile](docs/screenshots/search-mobile.png).

## Reviewing in 15 minutes

Five files, in this order, show the whole design:

1. [`src/app/page.tsx`](src/app/page.tsx): a server page, the composition root that hands the real adapter to the use case.
2. [`src/core/product/application/get-products.ts`](src/core/product/application/get-products.ts): a use case, the only place that knows the list rule: the first 20 unique phones, or every unique match of a search.
3. [`src/services/api-client.ts`](src/services/api-client.ts): the single door to the API, where the key, errors, caching and timeouts live.
4. [`src/core/cart/domain/cart-reducer.ts`](src/core/cart/domain/cart-reducer.ts): the cart rules, plain functions with no React or browser.
5. [`src/components/product-detail/product-detail.tsx`](src/components/product-detail/product-detail.tsx): a view built from tested pieces.

Then [`e2e/keyboard.spec.ts`](e2e/keyboard.spec.ts) walks the full journey with the keyboard alone. Quality at a glance: 43 unit and component test files with an axe check on every page, 11 Playwright specs on the production build against a fixed catalog (WCAG 2.2 AA audit at three widths, keyboard journey, clean console), a contract spec against the real API, and CI on every pull request.

## Beyond the brief, and why

These pieces cost reading time, so each one is here on purpose:

- **Hexagonal architecture**: catalog and cart rules are tested without Next, and a new API or a server-side cart is one more adapter. See [Architecture](#architecture).
- **Saved cart checked against the catalog**: a cart can sit for days in `localStorage` while prices and stock change in an external API. See [State](#state).
- **Normalized product photos**: the API's photos are inconsistent (white backgrounds, the phone filling 60% to 100% of the frame); `/api/images` brings them to the Figma framing. See [Performance](#performance).
- **Motion from the Figma prototype**: its springs and loading states, never blocking input and off with `prefers-reduced-motion`. See [UI and motion](#ui-and-motion).
- **Node 18 end to end**: the brief asks for Node 18, so every tool and the production server run on it. See [Data and API](#data-and-api).

## Brief coverage

How each point of the brief is met.

| Brief                                                                               | Where                                                                                                        |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Grid with the first 20 phones: image, name, brand and base price                    | `ProductGrid`, `ProductCard`, use case `src/core/product/application/get-products.ts`                        |
| Real-time search by name or brand, filtered by the API                              | `ProductSearch` → `/api/products`                                                                            |
| Result count next to the search                                                     | `ResultsCount` (`aria-live`)                                                                                 |
| Navbar with a home link and the cart count                                          | `Navbar`, `CartLink`                                                                                         |
| Persistent cart (`localStorage`)                                                    | `src/core/cart/infrastructure/local-storage-cart-repository.ts`                                              |
| Click a phone to open its detail                                                    | `ProductCard` link to `/product/[id]`                                                                        |
| Detail: name, brand, large image that changes with the color                        | `ProductDetail` (name in the title, image per color), `ProductSpecs` (brand in the specs table, as in Figma) |
| Storage and color selectors with real-time price; base price and storage variations | `StorageSelector`, `ColorSelector`, `ProductDetail`                                                          |
| Detailed specs                                                                      | `ProductSpecs`                                                                                               |
| "Añadir" enabled only once storage and color are chosen                             | `ProductDetail`                                                                                              |
| Similar products at the bottom                                                      | `SimilarProducts`                                                                                            |
| Cart: image, name, storage and color, price; remove; total; continue shopping       | `Cart`, `CartItem`                                                                                           |
| Responsive and faithful to Figma, Helvetica, Arial, sans-serif                      | `src/styles/variables.css` and each component's CSS                                                          |
| Development (unminified) and production (concatenated, minified) modes              | `pnpm dev`, `pnpm build && pnpm start`                                                                       |
| React ≥ 17, CSS, Node 18, Context API, `x-api-key`                                  | React 19.1, plain CSS, Node 18.20.8, `CartContext`, `src/services/api-client.ts`                             |
| Tests, accessibility, linters and formatters, clean console                         | [Quality](#quality), [Accessibility](#accessibility)                                                         |
| Optional: SSR with Next.js and CSS variables                                        | Server components for the list and detail; tokens in `variables.css`                                         |
| Optional: deployment                                                                | Own VPS on Node 18: <https://zara.oscarsancho.dev>                                                           |

## Getting started

Requirements: **Node 18.20.8** (`.nvmrc`) and **pnpm 10.34.6**.

```bash
nvm use
corepack enable                  # once per Node install: provides the pinned pnpm
pnpm install --frozen-lockfile
cp .env.example .env.local       # then set API_KEY
```

<details>
<summary>How the versions are enforced</summary>

pnpm 10.34.6 is the last pnpm major that runs on Node 18. `package.json` pins pnpm in `packageManager`, so Corepack (bundled with Node) provides that exact version with no global install. It also declares `"engines": { "node": ">=18.18.0 <19" }`, and `.npmrc` sets `engine-strict=true`, so installing on another Node major fails.

pnpm 10 skips dependency install scripts unless they are allowed: `pnpm.onlyBuiltDependencies` lists the three that prepare native binaries (`esbuild`, `sharp`, `unrs-resolver`).

</details>

| Variable       | Purpose                                                                             |
| -------------- | ----------------------------------------------------------------------------------- |
| `API_BASE_URL` | Products API base URL, already set in `.env.example`.                               |
| `API_KEY`      | Sent as the `x-api-key` header. Server only: never prefix it with `NEXT_PUBLIC_`.   |
| `SITE_URL`     | Public address of the deployed site, set before `pnpm build`. Empty for local runs. |

## Development and production

```bash
pnpm dev                  # development: unminified assets, fast refresh
pnpm build && pnpm start  # production: concatenated and minified assets on port 3000
pnpm warm-up [url]        # after start: loads the catalog and prepares every list photo
```

Normalized photos are kept in the server's memory, so after a deploy the first visitor would wait for about 20 of them at once. `pnpm warm-up` (default `http://localhost:3000`) requests the list and each of its photos at every width its `srcset` offers, one at a time, and exits with an error if any request fails.

## Scripts

| Script                         | What it does                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------ |
| `pnpm dev`                     | Development server.                                                            |
| `pnpm build`                   | Production build.                                                              |
| `pnpm start`                   | Serves the production build.                                                   |
| `pnpm warm-up [url]`           | Loads the catalog and prepares every list photo on a server just started.      |
| `pnpm lint`                    | ESLint (Next core web vitals, TypeScript, Prettier compatibility).             |
| `pnpm typecheck`               | `tsc --noEmit`.                                                                |
| `pnpm format` / `format:check` | Prettier, writing or only checking.                                            |
| `pnpm test`                    | Vitest unit and component tests.                                               |
| `pnpm test:coverage`           | The same with V8 coverage in `coverage/`.                                      |
| `pnpm test:e2e`                | Playwright end-to-end tests on the production build (see [Quality](#quality)). |
| `pnpm test:e2e:contract`       | The Playwright specs that check the app against the real API.                  |

## Architecture

Hexagonal: the business rules know nothing about Next, the API or the browser; each outside world plugs in through a port.

The catalog and the cart change for different reasons than the framework does, so each can evolve on its own: the browser already reaches the catalog through a second adapter (`http-product-repository`), a server-side cart or another API would be one more adapter, and both the use cases and the React layer are tested against plain fakes passed in as arguments or props, not against mocked module paths.

The dependency rule is checked by ESLint (`import/no-restricted-paths`), so a wrong import fails `pnpm lint`: the domain imports only the domain, the use cases only the domain, adapters only the core and `services`, and no component, hook or context imports an adapter.

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

Tests live in `__tests__/` next to the code they cover, and shared fixtures in `__mocks__/`. Use cases, components and the cart context are tested with in-memory repositories, adapters with a stubbed API client or `fetch`, and the browser's composition root with the real `localStorage`.

Only the server talks to the API:

1. The list and detail pages are server components that hold `apiProductRepository`: the list runs the `get-products` use case with it, and the detail, which has no rule of its own, asks it for the phone. The cart lives in the browser and needs no API call to be shown.
2. The repository validates the API data, removes repeated ids and points images to our domain; a use case exists only where there is a business rule.
3. `apiClient` (`import 'server-only'`) is the one place that knows the API URL and key. It maps a 404 to "not found" and sets caching and timeouts.
4. In the browser, the search calls our Route Handler `/api/products`, which runs the same use case.
5. Product photos load from `/api/images/[file]`, which fetches the original from the API host and normalizes it.

## Decisions

### Data and API

- **The API key never reaches the browser.** Pages fetch on the server and the search goes through `/api/products`.
- **Security headers** on every response: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` and `Content-Security-Policy: frame-ancestors 'none'`. A full CSP is left out because Next's inline scripts would need `'unsafe-inline'`, which cancels its protection, or a nonce per request, which renders every page dynamically and drops the cached catalog. HSTS is set by the HTTPS proxy in front of the app.
- **Node 18 end to end**, production included: the app runs on its own VPS because Vercel no longer offers Node 18. Tools are held to Node 18 compatible majors, with exact versions where it matters (Next 15.5.27, Playwright 1.61.1, vitest-axe 0.1.0).
- **Validated responses.** Type guards check the data at the boundary: a malformed phone is left out of a list, a malformed product shows the error page instead of a false "not found". A spec the API leaves out is not malformed data: the phone opens, and the specs table and the meta description leave that spec out.
- **One API call per product page.** The page and its metadata share the request through React `cache()`, so a slow or failing API is waited for once.
- **Prices follow the brief.** It asks for the "precio base" on each card, and for the "precio base y variaciones según almacenamiento" on the detail. Cards show `basePrice`, which is what the list endpoint returns. The detail opens with "From" and the cheapest storage price, as in Figma, then shows the price of the chosen storage. The two can differ: the API's `basePrice` is not always the cheapest storage (Galaxy S24 Ultra: 1329 EUR on the card, from 1229 EUR on the detail). Aligning them would take one detail request per card, so each view shows the price its endpoint provides.

### State

- **Cart with Context and `useReducer`.** Four actions (add, remove, restore and apply the catalog check) need no library.
- **One line per "Añadir"**, because Figma has no quantity control. A random id from `crypto.getRandomValues()`, which also works over plain HTTP, lets "Eliminar" remove exactly that line.
- **Stored cart read after mount and validated**, so server and first client render agree and edited or outdated data is ignored. The total is added in cents.
- **No cart count before the saved cart is read.** Until then the count is unknown, so the header shows no bag rather than a "0" that would be wrong for a cart with products, a state Figma never draws. The server HTML carries no count either.
- **One cart across tabs.** Every change is applied to the cart as saved at that moment, not to the copy a tab read earlier, so two tabs never overwrite each other; open tabs follow the saved cart, also when a page comes back from the back/forward cache. Only two writes within about a millisecond of each other could still collide. If the browser blocks storage, the cart lives in memory for the visit.
- **The saved cart is checked against the catalog when it opens.** It can be days old in `localStorage`, while the catalog belongs to an external API that changes on its own; this way a phone that is no longer sold or a new price shows up before paying, not after. Each phone is asked once through `/api/products/[id]`, which reads the catalog past the one-hour cache and sends its answer `no-store`, so the check sees today's price: a line whose phone, storage or color is no longer sold is removed, a line whose storage changed price gets the current one, and a short message says so. A phone that cannot be checked (network error, API down) is left as it is, so a failed request never empties a cart. Changes apply by line, so a line removed meanwhile stays removed.
- **A phone that left the catalog answers `null`, not 404**, from `/api/products/[id]`: it is an expected answer for the cart, and a 404 would print an error in the browser console.
- **Storage, color and search live in the URL**, so a configured phone or a search can be shared. `replaceState` keeps Back from undoing each choice.
- **Search retries without new UI.** A network error or a 5xx is retried once; pressing Enter repeats a failed search. Figma has no retry button.

### UI and motion

- **Plain CSS, BEM and tokens.** Every visual value lives once in `src/styles/variables.css`; breakpoints override the token, not each component.
- **Motion from the prototype.** Its springs become CSS `linear()` easings and duration tokens, run with CSS transitions and the Web Animations API on top of the live DOM. They never block a click, hover or keystroke, and `prefers-reduced-motion` turns them off.
- **Similar items**: a natively scrollable list that runs out to the right edge of the window, as the Figma carousel does. A mouse can drag the list itself or its decorative thumb, as in the prototype; touch keeps native scrolling.
- **"Añadir" opens the cart**, which dissolves in with the prototype's "Slow" spring.

<details>
<summary>Ambiguous Figma points, and how each was resolved</summary>

- Sizes come from the Design page; the Proto page is used for behaviour and motion. Some Proto frames sit a few pixels off the Design ones (search 51 px under the header instead of 60; "Specifications" 140 px under the add button instead of 154): the Design values are used.
- The colour swatches and names come from the API (`hexCode`, `name`). The Figma frames use sample colours and Spanish sample names ("Violeta Titanium") that do not match any product.
- A cart with several phones stacks them on mobile and tablet, and uses 548 px columns (the Figma cart item) on desktop.
- The header bag is hidden on the cart page except on tablet, where the frames show it with or without products (an outline bag and "0" when the cart is empty).
- "Continue shopping" goes to the full list, as in the prototype.
- First load: the prototype goes from "Unloaded" (header only) to "Loading" (the black bar grows to full width), then reveals the list, with fixed delays standing in for the network. The app keeps the states and the springs but not the delays, since the real wait comes from the network: on a page load of the list, the header shows with the loading bar filling under it (a single element in the layout, so it never starts over) while the server prepares the list, and the moment the list is in the page it comes in with the reveal spring while the bar dissolves with it. With the catalog cached the list comes a few tens of milliseconds after the header, so the bar has barely started when it dissolves; a list that comes with the first paint shows no bar at all. This is a deliberate departure from the prototype's timing: replaying its 300 ms hold and the bar's full fill would keep a list that has already arrived hidden for 0.7 s to 0.9 s. Navigating back to the list inside the app shows it at once.
- The prototype cross-fades from a card straight into the detail. The app shows the loading bar only while the product is on its way, then the detail enters with the prototype's spring.

</details>

### Performance

- **Normalized product photos.** The API's photos are inconsistent: some have an opaque white background and the phone fills 60% to 100% of the frame. The right fix is a standardized source from the backend; until then `/api/images` normalizes them with sharp to the Figma framing (transparent background, phone at 73.2% of a square).
- **Each photo is downloaded at the size its slot needs.** `/api/images` resizes as it normalizes, to one of five widths (360, 520, 648, 832 and 1260 px, the largest being the 630 px desktop detail at 2x); small source photos are never enlarged. `next/image` asks for them through a custom loader, and each photo declares its on-screen size in `sizes`, so the browser picks the smallest sharp one. `sizes` cannot read CSS custom properties, so the four values live in `src/lib/product-image-sizes.ts` and a test recomputes them from the tokens: changing a card or photo size without them fails the test. The 20 list photos went from 1.16 MB to 203 kB at 1440 px on a 2x screen, 330 kB on a 2x phone.
- **Normalized images are kept in memory, one per width,** and sent as `immutable`, since their URLs carry a version. Any other width is rejected, so the cache stays bounded by the catalog (under 8 MB).
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

## Quality

- **Unit and component tests** (Vitest, Testing Library), named after what the user experiences.
- **Accessibility checks** with vitest-axe on every page. jsdom loads no CSS, so contrast is checked by the end-to-end axe audit.
- **End-to-end tests** (Playwright, Chromium only) on the production build, against a fake API with a fixed catalog (`e2e/fake-api.mjs`), so a run never depends on the network and gives the same result every time. The catalog is a recording of the real one (`e2e/fixtures/catalog.json`): 24 entries with a repeated id, a search that finds more than 20 phones, a phone without one of its specs and storage prices below `basePrice`. The fake API draws the pictures, opaque white background included, so the image normalizer does its real work:
  - catalog and search, a search that fails within seconds when the API is down, detail and add-to-cart, and the cart;
  - the cart shared between two tabs, before and after a reload;
  - a header that never shows a cart count other than the saved one, and none without JavaScript;
  - an axe audit (WCAG 2.2 AA and best practices, contrast included) of eight screens at 393, 834 and 1920 px;
  - the whole journey with the keyboard alone, from the search to removing the phone from the cart;
  - the cart check against the catalog, with a clean console;
  - the security headers on pages and on the search proxy;
  - a check that fails on any console warning or error, or any unused stylesheet preload, on the list, a product, the cart and a 404;
  - a phone for which the fake API is down, proving a product page asks the API once, and one whose price changes on every request, proving the cart check reads the catalog live.
  - First run: `pnpm exec playwright install chromium`. Ports 3151 and 3199 must be free; no `.env.local` is needed.
- **Contract specs** (`pnpm test:e2e:contract`) on the production build against the real API, with no phone, price or count written in them: every phone of the catalog opens its detail with its photo (the 20 of the list and the ones only "Similar items" links to, so a product the app cannot render fails here), a search by brand finds phones of that brand, and an unknown id shows the not-found page. They need `.env.local` and port 3150, and wake the API up first.
- **Pre-commit**: Husky runs lint-staged (ESLint and Prettier on staged files).
- **CI** (GitHub Actions, each action pinned to a commit SHA): format check, lint, typecheck, tests with coverage, build and SonarCloud, then two independent jobs that upload the Playwright report if they fail: the end-to-end suite, with no secrets, and the contract specs, with the API secrets. A slow or changed API can only fail the second.
- **Git flow**: one branch per change, Conventional Commits, and every change merged through a [pull request](https://github.com/osancho/prueba-tecnica/pulls?q=is%3Apr) once CI passes. The repository was recreated on 3 October 2026; merges #1 to #32 refer to pull requests of the earlier copy.

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

## Known limitations

- A product that does not exist shows the "not found" page with HTTP 200 and `noindex`: the route has a loading state, so Next has already sent the 200 when `notFound()` runs. Unknown routes return 404.
- Some source photos have an opaque floor reflection under the phone (the Pixel 8a, for example) that cannot be told apart from the device safely. It is left as is; the fix belongs in the source image.
- The end-to-end suite runs on a recording of the catalog (4 October 2026) with drawn pictures. A change in the real API or in its photos is only seen by the contract specs, which depend on the real API being reachable.
- The normalized image cache lives in the server process and empties on restart; `pnpm warm-up` refills it for the list.
- There is no design for the 404, error and failed-search states, nor for the message about cart changes: they use the existing tokens with minimal styling.
- Accepted security advisories, every one `pnpm audit` reports (3 high, 2 moderate):
  - High, `sharp` (GHSA-f88m-g3jw-g9cj, libvips; GHSA-rgj7-g3m4-5g8c, libheif): the app only processes images from the API host (users cannot upload any), and sharp 0.35.4, which fixes both, requires Node 20.
  - High, `braces` (GHSA-vfj7-8cjw-p6xm, deeply nested patterns): development only, through `eslint-config-next` → `fast-glob` → `micromatch`; it only expands the lint globs of this repository, and no fixed version exists.
  - Moderate, `vitest` and `@vitest/mocker` (one advisory, GHSA-82fw-gwwq-j7x9): development only, in the test runner; fixed in Vitest 4.1.11, which requires Node 20.
