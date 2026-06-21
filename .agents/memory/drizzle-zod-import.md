---
name: drizzle-zod zod/v4 import
description: Schema files that use drizzle-zod createInsertSchema must import from "zod/v4" not "zod" — mismatched ZodType generic breaks typecheck
---

# Rule
In `lib/db/src/schema/*.ts`, always import `{ z }` from `"zod/v4"`, NOT `"zod"`.

**Why:** `drizzle-zod`'s `createInsertSchema` returns a `ZodObject` whose generic bounds are tied to the `zod/v4` type system. When the consuming file imports from plain `"zod"` (v3 API), TypeScript reports `TS2344: ZodObject does not satisfy ZodType<any,any,any>`. Even though zod ≥3.25 ships both APIs, the drizzle-zod integration resolves through the `/v4` re-export.

**How to apply:** The rest of the app (routes, frontend) uses `from "zod"` (v3 API). Only the DB schema files need `from "zod/v4"`. The error surface is the `z.infer<typeof insertXSchema>` line failing typecheck.
