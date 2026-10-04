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
- **Saved cart checked against the catalog**: a cart can sit for days in `localStorage` while prices and stock change in an external API. See [State](docs/decisions.md#state).
- **Normalized product photos**: the API's photos are inconsistent (white backgrounds, the phone filling 60% to 100% of the frame); `/api/images` brings them to the Figma framing. See [Performance](docs/decisions.md#performance).
- **Motion from the Figma prototype**: its springs and loading states, never blocking input and off with `prefers-reduced-motion`. See [UI and motion](docs/decisions.md#ui-and-motion).
- **Node 18 end to end**: the brief asks for Node 18, so every tool and the production server run on it. See [Data and API](docs/decisions.md#data-and-api).

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
| Tests, accessibility, linters and formatters, clean console                         | [Quality](#quality), [Accessibility](docs/decisions.md#accessibility)                                        |
| Optional: SSR with Next.js and CSS variables                                        | Server components for the list and detail; tokens in `variables.css`                                         |
| Optional: deployment                                                                | Own VPS on Node 18 behind Cloudflare: <https://zara.oscarsancho.dev>                                         |

## Getting started

Requirements: **Node 18.20.8** (`.nvmrc`) and **pnpm 10.34.6**.

```bash
nvm use
corepack enable                  # once per Node install: provides the pinned pnpm
pnpm install --frozen-lockfile
cp .env.example .env.local       # then set API_KEY
```

Installing on another Node major fails: see [Toolchain](docs/decisions.md#toolchain) for how the versions are enforced.

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

`pnpm warm-up` spares the first visitor after a deploy the wait for the list photos: see [Performance](docs/decisions.md#performance).

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

The dependency rule is checked by ESLint (`import/no-restricted-paths`), so a wrong import fails `pnpm lint`: the domain imports only the domain, the use cases only the domain, adapters only the core and `services`, and no component, hook or context imports an adapter.

- `src/core/product` and `src/core/cart`: each with its `domain` (types, ports and rules), `application` (use cases) and `infrastructure` (adapters).
- `src/app`: routes, and the composition roots: the only code that names an adapter.
- `src/services`: technical clients that implement no port (API client, server config, image normalization).
- `src/components`, `src/context`, `src/lib`: the React side, which receives its repositories.
- `e2e`: Playwright specs, the fake API and its fixed catalog.

Why this split, how it is tested and how a request reaches the API: [Architecture in detail](docs/decisions.md#architecture-in-detail).

## Decisions

The reasoning behind each choice lives in [docs/decisions.md](docs/decisions.md): [data and API](docs/decisions.md#data-and-api), [state](docs/decisions.md#state), [UI and motion](docs/decisions.md#ui-and-motion), [how the Figma design was read where it left room](docs/decisions.md#figma-interpretation), [performance](docs/decisions.md#performance) and the [API quirks](docs/decisions.md#api-quirks) and how each is handled.

## Quality

- **Unit and component tests** (Vitest, Testing Library), named after what the user experiences.
- **Accessibility checks** with vitest-axe on every page. jsdom loads no CSS, so contrast is checked by the end-to-end axe audit.
- **End-to-end tests** (Playwright, Chromium only) on the production build, against a fake API with a fixed catalog, so a run never depends on the network: the user journeys, the keyboard alone, an axe audit at three widths, the security headers and a clean console. See [Tests in detail](docs/decisions.md#tests-in-detail).
- **Contract specs** (`pnpm test:e2e:contract`) on the production build against the real API, with no phone, price or count written in them.
- **Pre-commit**: Husky runs lint-staged (ESLint and Prettier on staged files).
- **CI** (GitHub Actions, each action pinned to a commit SHA): format check, lint, typecheck, tests with coverage and build, with coverage thresholds that fail the run if coverage drops. Then three independent jobs: SonarCloud, on the coverage of the first job; the end-to-end suite, with no secrets; and the contract specs, with the API secrets. The last two upload the Playwright report if they fail. A missing Sonar token or a SonarCloud outage can only fail the first of them, and a slow or changed API only the last.
- **Accessibility and SEO**: what is done for each, in [Accessibility](docs/decisions.md#accessibility) and [SEO](docs/decisions.md#seo).
- **Git flow**: one branch per change, Conventional Commits, and every change merged through a [pull request](https://github.com/osancho/prueba-tecnica/pulls?q=is%3Apr) once CI passes. The repository was recreated on 3 October 2026; merges #1 to #32 refer to pull requests of the earlier copy.

## Known limitations

- A product that does not exist shows the "not found" page with HTTP 200 and `noindex`: the route has a loading state, so Next has already sent the 200 when `notFound()` runs. Unknown routes return 404.
- Some source photos have an opaque floor reflection under the phone (the Pixel 8a, for example) that cannot be told apart from the device safely. It is left as is; the fix belongs in the source image.
- The end-to-end suite runs on a recording of the catalog (4 October 2026) with drawn pictures. A change in the real API or in its photos is only seen by the contract specs, which depend on the real API being reachable.
- The normalized image cache lives in the server process and empties on restart; `pnpm warm-up` refills it for the list. A CDN in front, such as Cloudflare on the demo, keeps serving the photos it already holds.
- There is no design for the 404, error and failed-search states, nor for the message about cart changes: they use the existing tokens with minimal styling.
- Accepted security advisories, every one `pnpm audit` reports (3 high, 2 moderate):
  - High, `sharp` (GHSA-f88m-g3jw-g9cj, libvips; GHSA-rgj7-g3m4-5g8c, libheif): the app only processes images from the API host (users cannot upload any), and sharp 0.35.4, which fixes both, requires Node 20.
  - High, `braces` (GHSA-vfj7-8cjw-p6xm, deeply nested patterns): development only, through `eslint-config-next` → `fast-glob` → `micromatch`; it only expands the lint globs of this repository, and no fixed version exists.
  - Moderate, `vitest` and `@vitest/mocker` (one advisory, GHSA-82fw-gwwq-j7x9): development only, in the test runner; fixed in Vitest 4.1.11, which requires Node 20.
