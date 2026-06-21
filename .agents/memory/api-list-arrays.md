---
name: API list hooks return arrays
description: The generated useListTeams/Players/Matches hooks return plain arrays, not wrapped objects
---

All three list hooks (`useListTeams`, `useListPlayers`, `useListMatches`) return `Team[]`, `Player[]`, `Match[]` directly.

**Why:** The OpenAPI spec defines these endpoints as returning array schemas, so Orval generates hooks with `Promise<T[]>` return types.

**How to apply:** In any page or component using these hooks, access the data with `data ?? []`, never `data?.teams` or `data?.players`.
