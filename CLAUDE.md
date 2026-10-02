# CLAUDE.md

Technical test for a senior frontend role (Inditex / Zara): smartphone catalog with list, detail and cart views. Quality is what is evaluated: Figma fidelity, accessibility, tests, clean architecture, tidy Git history. Never invent anything that is not in the requirements or in the design.

## Git — hard rule

**Never run `git commit`, `git push`, create/switch/merge branches, or `git init`.** The user does all Git operations. At the end of each task, propose a branch name (`chore/…`, `feat/…`, `fix/…`, `test/…`, `docs/…`) and Conventional Commits messages, grouped so each commit makes sense on its own. After each merge the branch is deleted locally and on the remote. Every branch is merged to `main` through a Pull Request reviewed by the user: also provide the PR title and description (what, why, how to test), ready to paste. Watch out for tools that run Git implicitly (e.g. `create-next-app` needs `--disable-git`).

## Workflow

- Work and write like a senior engineer with 10+ years of experience: deliberate decisions, explicit trade-offs, nothing accidental.

- Comments only when they add information the code cannot express (a non-obvious why, an API quirk). No narrating comments, no task notes: comments explain why, never what. Names must make each function self-explanatory.
- Short files with a single responsibility.
- Never edit tracked files temporarily for visual checks: the user may be committing at the same time. Force states from the browser instead, or warn the user first and revert before they commit.

- Present a short plan before each task and wait for confirmation.
- Do not install dependencies that are not already in `package.json` without asking.
- If a requirement is ambiguous, ask instead of assuming.
- Code, names, comments and commits in English.

## Stack

- Next.js 15 App Router + TypeScript, React 19, SSR.
- **Node 18 strict**: `.nvmrc` = 18.20.8 (last Node 18 release), `engines` `>=18.18.0 <19` enforced by `engine-strict=true` in `.npmrc`. Pin any new tool to a Node 18 compatible version (e.g. Vitest 3, Vite 6, jsdom 26, lint-staged 15; typescript-eslint pinned to 8.55.0 via `overrides`). `postcss` is overridden to ^8.5.28 to patch the copy bundled by Next. `sharp` is overridden to ^0.34.5 (0.35 needs Node 20 and npm silently skips it, leaving `next/image` unoptimized); its HIGH libvips/libheif advisory is accepted: only images from the API host are processed. Known and accepted: 2 moderate advisories in Vitest 3 (GHSA-82fw-gwwq-j7x9, dev-only, fixed only in Vitest ≥ 4.1.11 which needs Node 20), documented in the README.
- Plain CSS, BEM, CSS custom properties. No Sass, Tailwind or CSS-in-JS.
- Cart state: React Context + `useReducer`, no external libraries.
- Vitest + Testing Library + vitest-axe 0.1.0 (`toHaveNoViolations` on every page; contrast is disabled in jsdom and checked in the browser). ESLint (next core-web-vitals + typescript + prettier) + Prettier. Husky + lint-staged on pre-commit.
- Deployment: the user's own VPS running Node 18 (`npm run build` + `npm start`), so the whole chain stays on Node 18 end to end. Vercel was discarded because it no longer offers Node 18.

## Commands

```
nvm use
npm run dev       # development (not minified)
npm run build     # production build (minified, concatenated)
npm start         # serve production build
npm run lint
npm run typecheck
npm run format        # format:check in CI
npm test              # test:coverage in CI
npm run test:e2e      # Playwright on the production build
```

## Structure

Hexagonal architecture, so the core evolves independently of the framework, the API and the browser:

```
src/
  app/          routes and composition root: pages and route handlers pass the real adapters to the use cases
                (page.tsx list, product/[id], cart, api/products search proxy, api/images image normalizer)
  core/<context>/
    domain/          types, ports (product-repository.ts, cart-repository.ts) and business rules (lowest-price, cart-line, cart-reducer)
    application/     use cases that receive a port: get-products (dedupe, 20 items), get-product
    infrastructure/  adapters: api-product-repository (validation, image URLs), local-storage-cart-repository
  services/     what talks to the outside: api-client.ts (server-only, single entry point to the API), api-errors.ts, server-config.ts, images/
  lib/          pure helpers and UI hooks only
  context/cart/ React adapter: wires the cart reducer to its repository
  components/   <component-name>/component-name.tsx + component-name.css
  styles/       variables.css (Figma tokens), globals.css
e2e/            Playwright specs, API warm-up, fake API (servers.ts holds the ports)
```

Naming:

- Folders and files in kebab-case (`product-card/product-card.tsx`). Exceptions: Next's special files (`page.tsx`, `layout.tsx`, `route.ts`, `[id]`) and config files. React components keep PascalCase names.
- The BEM block is the component name in kebab-case (`ProductCard` → `.product-card`).
- Tests in a `__tests__/` folder next to the code they cover; shared fixtures and mocks in `__mocks__/` (excluded from coverage and from Sonar sources).
- On macOS (`core.ignorecase`), case-only renames need `git rm -r --cached` before `git add`, or Linux CI sees the old names.

## Components

- Build bottom-up: base pieces first (button, icon, price, color selector, storage selector, search input…), each with its BEM CSS and test; then compositions (product card, navbar, cart line); views last. No view is assembled before its pieces are tested.
- SOLID in React: one responsibility per component; server pages fetch data, components receive props; composition over flag-heavy variants; no `fetch` inside presentational components; minimal props interfaces.

## Styles

- **Mobile first**: base styles for mobile, `@media (min-width: 768px)` tablet (Figma 834 frame values), `@media (min-width: 1280px)` desktop (Figma 1920 frame values).
- BEM with full class names (`.product-card__price`), never nested with `&`.
- Single source of truth: any value (size, color, spacing, breakpoint-dependent value) is defined once and referenced everywhere; changing it means editing one line. Responsive changes override the token inside the media query, not every component.
- Every visual value comes from `src/styles/variables.css` (tokens from Figma). Breakpoints are documented there but written literally in `@media` (custom properties do not work in media queries).
- Font: `Helvetica, Arial, sans-serif`.

## API

- Base URL `API_BASE_URL`, header `x-api-key` = `API_KEY` (in `.env.local`, never `NEXT_PUBLIC_`). **The key never reaches the browser.** Every call to the external API goes through a single `apiClient` (`src/services/api-client.ts`, `import 'server-only'`): base URL, auth header, error mapping (404 → not found), caching and timeouts live there; no other module calls `fetch` against the API. Responses are validated in `api-product-repository.ts` and deduped in the use cases. Client search goes through our Route Handler `/api/products`.
- Endpoints: `GET /products` (`search`, `limit`, `offset`; default 24) and `GET /products/{id}`.
- Duplicated ids in the list and in `similarProducts` → dedupe in the API layer. To show 20 unique products, request more than 20 and slice after deduping.
- Images come over `http://` and are inconsistent (2 of 62 with opaque white background, phone filling 60–100% of the picture). Ideally they would come right from the backend; since they do not, every image goes through `/api/images/[file]` (sharp: white background connected to the border → transparent, trim to the phone, then centre it in a transparent square at the Figma scale, 73.2%) to guarantee the quality standard. Results are kept in memory and served `immutable` (URLs carry `?v=`). `next/image` runs with `images.unoptimized: true`, since the optimizer would only add a second lossy pass. Known limit (documented in the README): some photos have an opaque floor reflection painted under the phone (e.g. Pixel 8a); it cannot be told apart from the device safely, so it is left as is — the right fix is the source asset.
- `basePrice` may differ from the cheapest storage price (Galaxy S24 Ultra: base 1329 €, 256 GB 1229 €). Cards show `basePrice` (the brief's "precio base", the only price the list endpoint returns); the detail shows "From" + `lowestPrice`, then the chosen storage price.
- Unknown id → 404 `{ "error": "NOT-FOUND", "message": "Product not found" }` → Next.js `not-found`.
- Render free plan: first request can be very slow → solid loading and error states.
- Search: ~300 ms debounce + `AbortController` to cancel previous requests.
- Cart persisted in `localStorage`, read after mount (no hydration mismatch). One cart line per "Añadir" (Figma has no quantity UI), keyed by a `lineId` from `crypto.randomUUID()`.

## Non-negotiable quality

- **Figma is literal law.** Implement exactly what it shows: values, copy (including its Spanish words such as "Añadir", "Eliminar"), per-breakpoint differences and every element in the design. Never propose alternatives or normalizations. Ask only when Figma does not define something.
- **Figma is the source of truth.** Never estimate values by eye; read them from the file. Before each view/component, inspect its node and all states (mobile, tablet, desktop, hover, selected, disabled) and the prototype; report findings. After each view, compare a Figma capture with the result and list differences. Figma MCP code is only a reference: translate to plain CSS + BEM + tokens + accessible markup.
- Frames per breakpoint (Mobile/Tablet/Desktop): Smartphones list, Results, Detail / Empty, Detail / Filled, Cart, Cart / Empty. The "Proto" page also has loading states. First load: "Unloaded" (header only) → after 1000 ms, spring 177.8/20 → "Loading" (header and the black bar at full width) → after 300 ms, spring 100/15 → list. Detail: "Smartphone detail / Loading" (header only) → after 1 ms, spring 180/30 → detail. The fixed delays stand in for the network. On a page load of `/`, `PageLoadBar` (in the root layout, outside the streamed page, so a single element) fills while the server prepares the list; when the list arrives, CSS holds it `--first-load-hold` (300 ms) and runs the bar fade and the list reveal together (`--first-load-reveal-delay`). The root `loading.tsx` renders nothing ("Unloaded"); the detail keeps its bar in `product/[id]/loading.tsx`. **No 404 or error designs** → minimal styling with existing tokens (documented in the README).
- Accessibility: semantic HTML, alt texts, form labels, `aria-live` on the results counter, readable cart counter label ("3 products in the cart"), keyboard-navigable color/storage selectors (radio group or `aria-pressed` buttons), visible focus, correct contrast. Target: Lighthouse a11y 100, zero axe errors.
- Responsive on mobile, tablet and desktop.
- Browser console free of errors and warnings, also in the production build.
- SEO above average, never generic: Next Metadata API only (no SEO libraries). Root `title.template` + specific description; `generateMetadata` on product detail (name, brand, description, product image for Open Graph); meaningful titles for list and cart; `robots.ts` / `sitemap.ts` and `metadataBase` once the deploy URL exists. One `h1` per page, logical heading order. UI copy, aria labels and metadata in English, as in Figma (`lang="en"`).
- Precise and complete wording in everything written (copy, alt texts, metadata, commits, docs).
- Minimal by default: native platform and stdlib first, no speculative abstractions, smallest diff that fully meets the requirements. Never trade away accessibility, security or required features.
- Tests describe what the end user experiences (named by outcome), not implementation details; pure helpers are covered through the behaviour that uses them. Server modules use `// @vitest-environment node`. Mocks/stubs are reset globally in `vitest.config.mts` — no per-file reset boilerplate.
- Minimum tests: cart reducer, search, detail add-to-cart disabled state. Playwright 1.61.1 E2E (`e2e/`, Chromium only, `npm run test:e2e`) runs the user journeys and a clean-console check on the production build; CI runs it with the `API_BASE_URL` and `API_KEY` secrets.
