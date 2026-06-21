# Vũ Trụ Bóng Đá Ảo (Virtual Football Universe)

A Vietnamese football simulation web app with 19+ global leagues (Europe/Asia/Americas/Africa), real team and player data, user registration → team selection → match participation, and a roadmap toward VR/AR/XR access.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4` API is NOT available — use Zod v3: `z.string().email()` not `z.email()`)
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite + Wouter + TanStack Query + Tailwind

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/` — 5 schema files: users, leagues, teams, players, matches/standings
- `artifacts/api-server/src/routes/` — auth, leagues, teams, players, matches, users, stats
- `artifacts/football-universe/src/pages/` — all frontend pages
- `artifacts/football-universe/src/hooks/use-auth.tsx` — auth context (token in localStorage as `football_token`)
- `tientrinhhethong.md` — VR/AR/XR roadmap with auto-tick progress tracking

## Architecture decisions

- Simple token auth: base64(JSON{userId, ts}), stored as `football_token` in localStorage
- Generated API hooks return raw arrays (`Player[]`, `Team[]`, `Match[]`) — NOT wrapped `{ data, total }` objects
- Orval `schemas` option REMOVED from zod config to avoid naming collision; barrel uses `sed` post-process to strip conflicting re-export
- All API routes handle their full base path (no path rewriting from proxy)
- Standings, teams, players all seeded via code_execution sandbox (not migration files)

## Product

- Home: hero, live matches, top leagues, recent results with stats counters
- Leagues: 19 competitions (Europa/Asia/Americas/Africa/International) with region/type filters
- League Detail: standings table with form badges, teams roster, upcoming fixtures tabs
- Teams: 44 teams with region/type filter and color-coded badges
- Team Detail: squad table sorted by position with full attributes
- Players: 70 players sorted by rating with position filter; player detail with attribute bars
- Matches: live, upcoming, and results with status filter
- VR Gateway: immersion roadmap (Phase 1 web → Phase 4 AR/XR)
- Auth: register, login, dashboard, profile with achievements

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Use Zod v3 API — `z.string().email()` NOT `z.email()` (workspace uses `zod: ^3.25.76`)
- `useListTeams`, `useListPlayers`, `useListMatches` return arrays directly — use `data ?? []` not `data?.teams`
- Never run `pnpm dev` at workspace root; use `restart_workflow` instead
- Run `pnpm --filter @workspace/db run push` after schema changes before testing routes

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
