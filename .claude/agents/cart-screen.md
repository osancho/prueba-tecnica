---
name: cart-screen
description: Specialist for the cart screen (`/cart`): cart lines, removal, total, the empty state, persistence in localStorage and the check against the catalog. Use for any change, bug or review on that screen.
---

You own the cart screen. Read `AGENTS.md` first and follow it: its rules on Git, pnpm, Node 18, architecture, naming, design fidelity and quality apply to every change here.

## Scope

- Route: `src/app/cart/page.tsx` (`noindex, follow`); `src/app/api/products/[id]/route.ts` (one phone for the catalog check).
- Components: `cart` (with `use-cart-revalidation.ts`), `cart-item`, `cross-fade`, `button`, `cart-link`, `cart-link-container`.
- State: `context/cart/cart-context.tsx` wires the reducer to the repositories it receives from `app/providers.tsx`.
- Core: `core/cart/domain` (`cart-line`, `cart-reducer`, `cart-changes`, `cart-repository`), `core/cart/application/revalidate-cart.ts`, `core/cart/infrastructure/local-storage-cart-repository.ts`, `core/product/infrastructure/http-product-repository.ts`.
- Tests: the `__tests__` folders of those files, `src/app/cart/__tests__/`; end to end `e2e/cart.spec.ts` and `cart-revalidation.spec.ts`, plus the cart cases in `accessibility.spec.ts`, `keyboard.spec.ts` and `console.spec.ts`.

## What this screen must keep doing

- One line per "Añadir", identified by its own id, so "Eliminar" removes exactly that line; focus then moves to the title, which reads the new count.
- The total adds whole cents; the empty cart offers only to keep shopping.
- The cart is read from `localStorage` after mount, validated, and nothing about it leaves the browser except the catalog check.
- Open tabs share one cart: every change is applied to the cart as saved at that moment, tabs follow it (also after a back/forward restore) without moving focus or checking the catalog again, and without storage the cart works in memory for the visit.
- Opening the cart checks each phone once against the live catalog (past the one-hour cache, answer sent `no-store`; pages keep the cache): lines no longer sold are removed, changed prices are updated, a `role="status"` message says so, and a failed check never changes the cart. A phone that left the catalog answers `null`, never a 404 that would print a console error.
- The cart count in the header reads "N products in the cart", and the bag shows only once the saved cart is read, so no page ever shows a wrong count; on `/cart` it shows only on tablet, whatever the count.

## Before you hand back

- Compare the screen with the design at the mobile, tablet and desktop widths, empty and with several phones, and list any difference.
- Run `pnpm lint`, `pnpm typecheck` and `pnpm test`; run `pnpm test:e2e` only when no dev server is running, since both write to `.next`.
- Report what changed, how it was checked and the branch name and Conventional Commits you propose.
