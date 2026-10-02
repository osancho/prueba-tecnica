# MBST — Smartphones

**English** · [Español](README.es.md)

A smartphone store built with Next.js 15 and React 19: browse and search the catalog, configure a phone and keep a cart.

- **List** (`/`): the first 20 phones, live search with the result count, and the search kept in the URL.
- **Detail** (`/product/[id]`): photo per color, storage and color selectors with the price updating as you choose, specs and similar phones.
- **Cart** (`/cart`): one line per added phone, removal, total and an empty state.

Live demo and screenshots are published with the deployment.

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
| Optional: deployment                                                                | Own VPS on Node 18 (link above once published)                                                               |

## Getting started

Requirements: **Node 18.20.8** (`.nvmrc`) and **pnpm 10.34.6**, the last pnpm major that runs on Node 18. `package.json` pins pnpm in `packageManager`, so Corepack (bundled with Node) provides that exact version with no global install. It also declares `"engines": { "node": ">=18.18.0 <19" }`, and `.npmrc` sets `engine-strict=true`, so installing on another Node major fails.

```bash
nvm use
corepack enable                  # once per Node install: provides the pinned pnpm
pnpm install --frozen-lockfile
cp .env.example .env.local       # then set API_KEY
```

pnpm 10 skips dependency install scripts unless they are allowed: `pnpm.onlyBuiltDependencies` lists the three that prepare native binaries (`esbuild`, `sharp`, `unrs-resolver`).

| Variable       | Purpose                                                                           |
| -------------- | --------------------------------------------------------------------------------- |
| `API_BASE_URL` | Products API base URL, already set in `.env.example`.                             |
| `API_KEY`      | Sent as the `x-api-key` header. Server only: never prefix it with `NEXT_PUBLIC_`. |

## Development and production

```bash
pnpm dev                  # development: unminified assets, fast refresh
pnpm build && pnpm start  # production: concatenated and minified assets on port 3000
```

## Scripts

| Script                         | What it does                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------ |
| `pnpm dev`                     | Development server.                                                            |
| `pnpm build`                   | Production build.                                                              |
| `pnpm start`                   | Serves the production build.                                                   |
| `pnpm lint`                    | ESLint (Next core web vitals, TypeScript, Prettier compatibility).             |
| `pnpm typecheck`               | `tsc --noEmit`.                                                                |
| `pnpm format` / `format:check` | Prettier, writing or only checking.                                            |
| `pnpm test`                    | Vitest unit and component tests.                                               |
| `pnpm test:coverage`           | The same with V8 coverage in `coverage/`.                                      |
| `pnpm test:e2e`                | Playwright end-to-end tests on the production build (see [Quality](#quality)). |

## Architecture

Hexagonal: the business rules know nothing about Next, the API or the browser; each outside world plugs in through a port.

```
src/
  app/                  routes, and the composition root: they hand the real adapters to the use cases
    api/products        Route Handler for the client-side search
    api/products/[id]   one phone for the cart check, so the API key stays on the server
    api/images          image proxy that normalizes product photos
  core/
    product/
      domain/           Product types, the ProductRepository port, the "From" price rule
      application/      use cases: get-products (unique phones, 20 of them), get-product
      infrastructure/   api-product-repository: calls the API, validates, builds image URLs;
                        http-product-repository: the browser's way in, through our Route Handler
    cart/
      domain/           cart lines, total, reducer, the changes a catalog check can bring, CartRepository port
      application/      revalidate-cart: checks saved lines against the catalog
      infrastructure/   local-storage-cart-repository
  services/             API client and errors, server config, image normalization
  lib/                  pure helpers and UI hooks
  context/cart/         React context that wires the cart to its repository
  components/           one kebab-case folder per component: component.tsx, .css, __tests__/
  styles/               variables.css (design tokens) and globals.css
e2e/                    Playwright specs, API warm-up and the fake API used by one test
```

Tests live in `__tests__/` next to the code they cover, and shared fixtures in `__mocks__/`. Use cases are tested with an in-memory repository, adapters with a stubbed API client.

Only the server talks to the API:

1. The list and detail pages are server components that run the `get-products` and `get-product` use cases with `apiProductRepository`. The cart lives in the browser and needs no API call.
2. The use cases remove duplicated phones; the repository validates the API data and points images to our domain.
3. `apiClient` (`import 'server-only'`) is the one place that knows the API URL and key. It maps a 404 to "not found" and sets caching and timeouts.
4. In the browser, the search calls our Route Handler `/api/products`, which runs the same use case.
5. Product photos load from `/api/images/[file]`, which fetches the original from the API host and normalizes it.

## Decisions

### Data and API

- **The API key never reaches the browser.** Pages fetch on the server and the search goes through `/api/products`.
- **Node 18 end to end**, production included: the app runs on its own VPS because Vercel no longer offers Node 18. Tools are held to Node 18 compatible majors, with exact versions where it matters (Next 15.5.27, Playwright 1.61.1, vitest-axe 0.1.0).
- **Validated responses.** Type guards check the data at the boundary: a malformed phone is left out of a list, a malformed product shows the error page instead of a false "not found".
- **One API call per product page.** The page and its metadata share the request through React `cache()`, so a slow or failing API is waited for once.
- **Prices follow the brief.** It asks for the "precio base" on each card, and for the "precio base y variaciones según almacenamiento" on the detail. Cards show `basePrice`, which is what the list endpoint returns. The detail opens with "From" and the cheapest storage price, as in Figma, then shows the price of the chosen storage. The two can differ: the API's `basePrice` is not always the cheapest storage (Galaxy S24 Ultra: 1329 EUR on the card, from 1229 EUR on the detail). Aligning them would take one detail request per card, so each view shows the price its endpoint provides.

### State

- **Cart with Context and `useReducer`.** Four actions (add, remove, restore and apply the catalog check) need no library.
- **One line per "Añadir"**, because Figma has no quantity control. A `crypto.randomUUID()` id lets "Eliminar" remove exactly that line.
- **Stored cart read after mount and validated**, so server and first client render agree and edited or outdated data is ignored. The total is added in cents.
- **The saved cart is checked against the catalog when it opens.** Each phone is asked once through `/api/products/[id]`: a line whose phone, storage or color is no longer sold is removed, a line whose storage changed price gets the current one, and a short message says so. A phone that cannot be checked (network error, API down) is left as it is, so a failed request never empties a cart. Changes apply by line, so a line removed meanwhile stays removed.
- **A phone that left the catalog answers `null`, not 404**, from `/api/products/[id]`: it is an expected answer for the cart, and a 404 would print an error in the browser console.
- **Storage, color and search live in the URL**, so a configured phone or a search can be shared. `replaceState` keeps Back from undoing each choice.
- **Search retries without new UI.** A network error or a 5xx is retried once; pressing Enter repeats a failed search. Figma has no retry button.

### UI and motion

- **Plain CSS, BEM and tokens.** Every visual value lives once in `src/styles/variables.css`; breakpoints override the token, not each component.
- **Motion from the prototype.** Its springs become CSS `linear()` easings and duration tokens, run with CSS transitions and the Web Animations API on top of the live DOM. They never block a click, hover or keystroke, and `prefers-reduced-motion` turns them off.
- **Similar items**: a natively scrollable list that runs out to the right edge of the window, as the Figma carousel does. A mouse can drag the list itself or its decorative thumb, as in the prototype; touch keeps native scrolling.
- **"Añadir" opens the cart**, which dissolves in with the prototype's "Slow" spring.
- **Ambiguous Figma points**, resolved:
  - Sizes come from the Design page; the Proto page is used for behaviour and motion. Some Proto frames sit a few pixels off the Design ones (search 51 px under the header instead of 60; "Specifications" 140 px under the add button instead of 154): the Design values are used.
  - The colour swatches and names come from the API (`hexCode`, `name`). The Figma frames use sample colours and Spanish sample names ("Violeta Titanium") that do not match any product.
  - A cart with several phones stacks them on mobile and tablet, and uses 548 px columns (the Figma cart item) on desktop.
  - The header bag is hidden on the cart page except on tablet with products in the cart, as the frames show.
  - "Continue shopping" goes to the full list, as in the prototype.
  - First load: the prototype goes from "Unloaded" (header only) to "Loading" (the black bar grows to full width), then reveals the list, with fixed delays standing in for the network. The app keeps the prototype's exact timing in pure CSS: on a page load of the list, the header shows with the loading bar filling under it (a single element in the layout, so it never starts over); when the list arrives, the bar holds 300 ms and hands over to the list with the reveal spring. Navigating back to the list inside the app shows it at once.
  - The prototype cross-fades from a card straight into the detail. The app shows the loading bar only while the product is on its way, then the detail enters with the prototype's spring.

### Performance

- **Normalized product photos.** The API's photos are inconsistent: some have an opaque white background and the phone fills 60% to 100% of the frame. The right fix is a standardized source from the backend; until then `/api/images` normalizes them with sharp to the Figma framing (transparent background, phone at 73.2% of a square).
- **Normalized images are kept in memory** and sent as `immutable`, since their URLs carry a version.
- **The catalog is cached for an hour; searches are not**, so each search term does not become a new cache entry on disk.
- **No prefetch on the cart link.** Prefetching `/cart` preloaded its stylesheet on every page, which Chrome reported as an unused preload.

## API quirks

| Problem                                                        | How it is handled                                                                                                     |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Repeated ids in the list and in similar products               | 40 items are requested, duplicates removed, and the list cut to 20.                                                   |
| Images served over `http` and inconsistent                     | Proxied and normalized through `/api/images` on our domain.                                                           |
| `basePrice` differs from the storage prices                    | Cards show `basePrice`, the detail the storage prices; see [Data and API](#data-and-api).                             |
| Unknown id answers 404 `NOT-FOUND`                             | `apiClient` throws `NotFoundError`, and the page calls `notFound()`.                                                  |
| Render free plan: the first request can take close to a minute | 60 s timeout, one automatic retry for the search, the prototype's loading states, and a warm-up before the E2E suite. |
| Responses not shaped as documented                             | Type guards drop invalid items and turn an invalid product into an error.                                             |

## Quality

- **Unit and component tests** (Vitest, Testing Library), named after what the user experiences.
- **Accessibility checks** with vitest-axe on every page. jsdom loads no CSS, so contrast is checked by the end-to-end axe audit.
- **End-to-end tests** (Playwright, Chromium only) on the production build:
  - catalog and search, detail and add-to-cart, and the cart;
  - an axe audit (WCAG 2.2 AA and best practices, contrast included) of eight screens at 393, 834 and 1920 px;
  - the whole journey with the keyboard alone, from the search to removing the phone from the cart;
  - the cart check against the catalog, with a clean console;
  - a check that fails on any console warning or error, or any unused stylesheet preload, on the list, a product, the cart and a 404;
  - a second server pointed at a fake API that is down, proving a product page asks the API once.
  - First run: `pnpm exec playwright install chromium`. They use the real API, so `.env.local` must be set, and ports 3150, 3151 and 3199 must be free.
- **Pre-commit**: Husky runs lint-staged (ESLint and Prettier on staged files).
- **CI** (GitHub Actions, each action pinned to a commit SHA): format check, lint, typecheck, tests with coverage, build and SonarCloud, then the E2E job, which uploads the Playwright report if it fails.
- **Git flow**: one branch per change, Conventional Commits, and every change merged through a reviewed [pull request](https://github.com/osancho/prueba-tecnica/pulls?q=is%3Apr).

## Accessibility

- Storage and color are native radio groups in a `fieldset` with a `legend`: keyboard ready and announced as a group.
- The result count is an `aria-live` region; the cart link reads "3 products in the cart".
- After "Eliminar", focus moves to the cart title, which reads the new count.
- Spanish copy from Figma ("Añadir", "Eliminar") is marked `lang="es"` on an English page.
- Card pictures keep a descriptive `alt` for when they fail to load; the card link takes its name from the visible text only, so the phone is announced once.
- The message about cart changes is a `role="status"` region, present from the start so it is announced when it fills.
- Animations respect `prefers-reduced-motion`.
- Two deliberate Figma choices: the search input has no outline, the text caret being its focus indicator (the "Input active" frame), and the placeholder keeps the design's grey.

## SEO

- The root layout sets a title template (`%s | MBST`, default "Smartphones | MBST") and a description.
- Each product page builds its title from brand and name, and its description from the "From" price, screen, processor and battery (`generateMetadata`).
- A search has its own title ("Results for “galaxy” | MBST"); search pages and the cart are `noindex, follow`.
- One `h1` per page (visually hidden on the list, where Figma shows no title), headings in order, `lang="en"`.
- `robots.txt`, the sitemap, `metadataBase` and the Open Graph image come with the deployment, once the domain is known.

## Known limitations

- A product that does not exist shows the "not found" page with HTTP 200 and `noindex`: the route has a loading state, so Next has already sent the 200 when `notFound()` runs. Unknown routes return 404.
- `crypto.randomUUID()` only exists in secure contexts, so the app is served over HTTPS (or on `localhost`).
- Some source photos have an opaque floor reflection under the phone (the Pixel 8a, for example) that cannot be told apart from the device safely. It is left as is; the fix belongs in the source image.
- The E2E suite depends on the real API being reachable.
- The normalized image cache lives in the server process and empties on restart.
- There is no design for the 404, error and failed-search states, nor for the message about cart changes: they use the existing tokens with minimal styling.
- Accepted security advisories:
  - 2 moderate in Vitest 3 (GHSA-82fw-gwwq-j7x9): development only; fixed in Vitest 4.1.11, which requires Node 20.
  - High in the libvips bundled with sharp: the app only processes images from the API host.

## How this was built

I built this project with AI assistance (Claude Code), working under explicit rules versioned in [`AGENTS.md`](AGENTS.md): Node 18 end to end, Figma as the source of truth, accessibility, tests named after behaviour and a single source of truth for every value. I reviewed every change in a pull request, and checked every design decision against the Figma file.
