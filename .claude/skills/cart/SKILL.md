---
name: cart
description: Works on the cart through the cart-screen specialist subagent.
argument-hint: <task on the cart>
disable-model-invocation: true
---

Task on the cart, from the user:

$ARGUMENTS

If the task above is empty, ask what to do on this screen first.

Hand the task to the `cart-screen` subagent in two steps, so `AGENTS.md` (plan first, wait for confirmation) holds even though a subagent cannot ask the user anything:

1. Ask it for a short plan without changing any file, and show that plan to the user.
2. Once the user confirms, ask the same `cart-screen` subagent to carry it out, then relay its report: what changed, how it was checked, and the proposed branch and commits.

Example: `/cart review the change message on mobile`.
