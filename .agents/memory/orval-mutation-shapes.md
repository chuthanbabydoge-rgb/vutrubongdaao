---
name: Orval mutation variable shapes
description: How Orval generates TanStack mutation variable types — body vs path-param mutations have different shapes
---

# Rule
Orval generates two distinct mutation variable shapes depending on the OpenAPI operation:

1. **POST with request body** → variables shape `{data: BodyType<InputSchema>}`
   - Example: `useSetupPlayerProfile` → `mutate({ data: { position: "ST", pace: 5 } })`
   - Example: `useRegisterUser` → `mutate({ data: { username, email, password } })`

2. **POST with only path params (no body)** → variables shape `{matchId: number}` (one prop per path param)
   - Example: `useSimulateMatch` → `mutate({ matchId: 42 })`
   - Example: `usePlayMatch` → `mutate({ matchId: 42 })`

**Why:** Orval extracts variables from the raw function signature. Body-POST functions take `(data: Input)` → wrapped in `{data}`. Path-param-only functions take `(matchId: number)` → wrapped as `{matchId}`.

**How to apply:** Before calling any mutation, grep the generated api.ts for `MutationFunction<..., {` to see the exact variables type shape.
