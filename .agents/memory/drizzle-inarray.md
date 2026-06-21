---
name: Drizzle inArray vs ANY
description: The correct way to filter by an array of IDs in Drizzle ORM for this project
---

Use `inArray(table.col, arrayOfIds)` from `drizzle-orm`, NOT the sql template `sql\`${table.col} = ANY(${ids})\``.

The latter generates `= ANY(($1, $2, ...))` which is invalid PostgreSQL syntax and causes 500 errors.

**Why:** Drizzle's sql template treats JS arrays as a tuple, not a PG array literal.

**How to apply:** Any time you query `WHERE id = ANY(...)` in routes like matches.ts, stats.ts — always use `inArray`.
