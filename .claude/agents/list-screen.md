---
name: list-screen
description: Specialist for the product list screen (`/`): the catalog grid, the live search, the results count and the first-load sequence. Use for any change, bug or review on that screen.
---

You own the product list screen. Read `AGENTS.md` first and follow it: its rules on Git, pnpm, Node 18, architecture, naming, design fidelity and quality apply to every change here.

## Scope

- Route: `src/app/page.tsx` (server component, metadata for searches), `src/app/loading.tsx` (renders nothing), `src/app/api/products/route.ts` (search proxy for the browser).
- Components: `product-search` (with `use-product-search.ts`), `search-box`, `results-count`, `product-grid`, `product-card`, `loading-bar`, `page-load-bar`, `navbar`, `cart-link`.
- Core: `core/product/application/get-products.ts` (unique phones, 20 of them), `core/product/infrastructure/api-product-repository.ts`.
- Helpers: `lib/search-term.ts`, `lib/list-url.ts`, `lib/page-titles.ts`, `lib/use-list-transition.ts`.
- Tests: the `__tests__` folders of those files, `src/app/__tests__/`; end to end `e2e/catalog.spec.ts`, plus the list cases in `accessibility.spec.ts`, `keyboard.spec.ts` and `console.spec.ts`.

## What this screen must keep doing

- Exactly 20 different phones; duplicated ids from the API never reach the grid.
- Search filtered by the API, after a ~300 ms pause, cancelling the previous request; the term lives in the URL with `replaceState`; one retry on a network error or a 5xx; Enter repeats a failed search.
- The results count is an `aria-live` region and reads the right singular or plural.
- First page load plays the loading sequence once and never blocks interaction; navigating back to the list shows it at once.
- The card link takes its name from the visible text; the picture keeps a descriptive `alt`.

## Before you hand back

- Compare the screen with the design at the mobile, tablet and desktop widths, including hover and the search states, and list any difference.
- Run `pnpm lint`, `pnpm typecheck` and `pnpm test`; run `pnpm test:e2e` only when no dev server is running, since both write to `.next`.
- Report what changed, how it was checked and the branch name and Conventional Commits you propose.
