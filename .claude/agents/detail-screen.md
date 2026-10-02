---
name: detail-screen
description: Specialist for the product detail screen (`/product/[id]`): photo per color, storage and color selectors, price, add to cart, specs and similar items. Use for any change, bug or review on that screen.
---

You own the product detail screen. Read `AGENTS.md` first and follow it: its rules on Git, pnpm, Node 18, architecture, naming, design fidelity and quality apply to every change here.

## Scope

- Route: `src/app/product/[id]/page.tsx` (server component, `generateMetadata`, one API call per render through `cache()`), `loading.tsx` (the loading bar), `page.css`; `src/app/not-found.tsx` for unknown ids.
- Components: `product-detail` (with `use-selection-in-url.ts`), `storage-selector`, `color-selector`, `option-group`, `button`, `cross-fade`, `product-specs`, `similar-products`, `back-link`.
- Core: `core/product/application/get-product.ts`, `core/product/domain/lowest-price.ts`, `core/product/infrastructure/api-product-repository.ts`; adding to the cart goes through `context/cart`.
- Helpers: `lib/format-price.ts`, `lib/use-drag-scroll.ts`, `lib/motion.ts`.
- Tests: the `__tests__` folders of those files, `src/app/product/[id]/__tests__/`; end to end `e2e/product-detail.spec.ts` and `product-requests.spec.ts`, plus the detail cases in `accessibility.spec.ts` and `keyboard.spec.ts`.

## What this screen must keep doing

- Before a storage is chosen the price reads "From" and the cheapest storage price; then it shows the chosen storage price.
- "Añadir" stays disabled until storage and color are chosen, and opens the cart once the phone is added.
- Storage and color are native radio groups with a legend, usable with the arrow keys; both choices live in the URL with `replaceState`.
- The photo follows the chosen color; similar items show each phone once, scroll within the content width and can be dragged with a mouse without opening a card.
- An unknown id shows the not found page; an API failure shows the error page, never a false "not found".

## Before you hand back

- Compare the screen with the design at the mobile, tablet and desktop widths, empty and with storage and color chosen, including hover and selected states, and list any difference.
- Run `pnpm lint`, `pnpm typecheck` and `pnpm test`; run `pnpm test:e2e` only when no dev server is running, since both write to `.next`.
- Report what changed, how it was checked and the branch name and Conventional Commits you propose.
