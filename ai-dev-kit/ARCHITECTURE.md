# ARCHITECTURE.md — Sports Universe · AI Dev Kit

> Tài liệu kiến trúc kỹ thuật cho nền tảng Sports Universe.
> Mô tả cấu trúc hệ thống, các thành phần, và mối quan hệ giữa chúng.

---

## 1. Tổng quan kiến trúc

```
╔══════════════════════════════════════════════════════════════╗
║                        AI UNIVERSE                           ║
║                                                              ║
║  ┌─────────┐  ┌────────┐  ┌────────┐  ┌──────────────────┐  ║
║  │  User   │  │ Avatar │  │ Wallet │  │    Inventory     │  ║
║  └─────────┘  └────────┘  └────────┘  └──────────────────┘  ║
║  ┌─────────┐  ┌──────────────────┐                          ║
║  │ Friends │  │    AI Agents     │   ← GLOBAL SYSTEMS       ║
║  └─────────┘  └──────────────────┘   (Universe main owns)   ║
║                                                              ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │                   SPORTS UNIVERSE                      │  ║
║  │                                                        │  ║
║  │  ┌──────────────────────────────────────────────────┐  │  ║
║  │  │              Football Module (Active ✅)          │  │  ║
║  │  │  SportsProfile · SportStatistics · Achievements  │  │  ║
║  │  │  FootballProfile · FootballLeague · FootballTeam │  │  ║
║  │  │  FootballMatch · MatchEngine · RuleEngine        │  │  ║
║  │  └──────────────────────────────────────────────────┘  │  ║
║  │                                                        │  ║
║  │  ┌──────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │  ║
║  │  │Basketball│ │Tennis  │ │Racing  │ │Boxing  │  🔜     │  ║
║  │  └──────────┘ └────────┘ └────────┘ └────────┘        │  ║
║  └────────────────────────────────────────────────────────┘  ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 2. Cấu trúc monorepo

```
workspace/
├── artifacts/
│   ├── api-server/          # Backend Express 5 (port 8080)
│   │   └── src/
│   │       ├── routes/      # auth, leagues, teams, players, matches, users, stats
│   │       ├── lib/
│   │       └── middlewares/
│   └── football-universe/   # Frontend React 19 + Vite (port 19742)
│       └── src/
│           ├── pages/       # home, leagues, teams, players, matches, match-engine, ...
│           ├── components/  # ui/, match/, vr/
│           └── hooks/
├── lib/
│   ├── db/                  # Drizzle ORM + PostgreSQL schema
│   │   └── src/schema/
│   │       ├── users.ts          # Legacy user table
│   │       ├── leagues.ts        # Legacy leagues table
│   │       ├── teams.ts          # Legacy teams table
│   │       ├── players.ts        # Legacy players table
│   │       ├── matches.ts        # Legacy matches + events + standings
│   │       └── sports-universe.ts # NEW: 7 clean Sports Universe tables
│   ├── api-spec/            # OpenAPI spec — nguồn sự thật API contract
│   ├── api-client-react/    # Generated TanStack Query hooks (Orval)
│   ├── api-zod/             # Generated Zod schemas (Orval)
│   └── sports-engine/       # Sport module interfaces + implementations
│       └── src/
│           ├── interfaces/  # SportModule, MatchEngine, RuleEngine, ScoringEngine
│           ├── types/       # common.ts — MatchContext, MatchResult, UserPerformance, ...
│           ├── sports/
│           │   ├── football/     # FootballModule (Active ✅)
│           │   ├── basketball/   # BASKETBALL_METADATA (Coming soon 🔜)
│           │   ├── tennis/       # TENNIS_METADATA    (Coming soon 🔜)
│           │   ├── racing/       # RACING_METADATA    (Coming soon 🔜)
│           │   └── boxing/       # BOXING_METADATA    (Coming soon 🔜)
│           └── registry/    # sportRegistry singleton
├── scripts/                 # Seed, migration utilities
└── ai-dev-kit/              # Tài liệu phát triển AI (thư mục này)
```

---

## 3. Stack công nghệ

| Layer | Công nghệ |
|---|---|
| Runtime | Node.js 24, TypeScript 5.9 |
| Package manager | pnpm workspaces |
| Backend | Express 5 |
| Database | PostgreSQL + Drizzle ORM 0.45 |
| Validation | Zod v3 (`z.string().email()` — KHÔNG dùng `z.email()`) |
| API spec | OpenAPI (Swagger) — `lib/api-spec/openapi.yaml` |
| API codegen | Orval (tạo hooks và Zod schemas từ OpenAPI) |
| Frontend | React 19, Vite 7, Wouter, TanStack Query 5 |
| Styling | Tailwind CSS 4, Radix UI, Framer Motion |
| 3D/XR | Three.js, WebXR (Phase 5) |
| Build | esbuild (backend CJS bundle) |

---

## 4. Lớp Database

### Nguyên tắc
- Bảng **legacy** (`leagues`, `teams`, `players`, `matches`, `users`) giữ nguyên — backward compat
- Bảng **Sports Universe** mới tại `lib/db/src/schema/sports-universe.ts` — kiến trúc sạch

### Quan hệ sở hữu

```
Universe main (external)          Sports Universe (this module)
─────────────────────────         ─────────────────────────────────────
User          (user_id) ─────────→ sports_profiles.user_id
Avatar     (avatar_id) ─────────→ sports_profiles.avatar_id
                                    football_profiles.avatar_id
Wallet     (wallet_id) ·········→ [tham chiếu khi cần — chưa implement]
Inventory (inventory_id) ·······→ [tham chiếu khi cần — chưa implement]
Friends     (qua user_id) ······→ [dùng lại qua user_id — không cần bảng riêng]
AI Agents   (agent_id) ·········→ [tham chiếu khi cần — chưa implement]
```

> `─────→` = đã implement (integer/text reference, không FK)
> `·······→` = sẽ implement khi cần (chưa có bảng)

### Sơ đồ bảng Sports Universe

```
sports_profiles (user_id UNIQUE)
    ↓ 1:1
football_profiles (user_id UNIQUE)

sports_profiles (user_id)
    ↓ 1:N
sport_statistics (user_id, sport_id UNIQUE)
sport_achievements (user_id, achievement_key UNIQUE)

football_leagues
    ↓ 1:N
football_teams (league_id)
    ↓ 1:N
football_matches (home_team_id, away_team_id, league_id)
```

---

## 5. Lớp API

### Prefix: `/api`

| Group | Endpoints | Ghi chú |
|---|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | Tự triển khai (sẽ thay bằng Universe main auth) |
| Leagues | `GET /leagues`, `GET /leagues/:id` | Legacy |
| Teams | `GET /teams`, `GET /teams/:id` | Legacy |
| Players | `GET /players`, `GET /players/:id` | Legacy |
| Matches | `GET /matches`, `POST /matches`, `GET /matches/:id`, `POST /matches/:id/simulate`, `POST /matches/:id/play` | Legacy |
| Users | `GET /users/:id`, `PATCH /users/:id` | Legacy |
| Stats | `GET /stats/overview`, `GET /stats/live-matches`, `GET /stats/recent-matches` | Legacy |

> **Nguồn sự thật:** `lib/api-spec/openapi.yaml`
> **Không thêm endpoint mới** mà không cập nhật OpenAPI spec trước.

---

## 6. Lớp Sports Engine

### Interfaces (tại `lib/sports-engine/src/interfaces/`)

```typescript
SportModule       // top-level: kết nối 3 engine bên dưới
  ├── MatchEngine   // simulate() + simulateWithUser()
  ├── RuleEngine    // validateMatchContext() + getEventTypes()
  └── ScoringEngine // calculateScores() + updateStandings()
```

### Sử dụng

```typescript
import { sportRegistry } from '@workspace/sports-engine/registry';

// Lấy module bóng đá và chạy mô phỏng
const football = sportRegistry.getOrThrow('football');
const result = await football.matchEngine.simulate(context);

// Liệt kê tất cả môn (active + coming soon) — dùng cho UI
const all = sportRegistry.listAll();
// → [{ sportId: 'football', status: 'active' }, { sportId: 'basketball', status: 'coming_soon' }, ...]
```

### Thêm môn thể thao mới

```typescript
// 1. Implement 3 engines
class BasketballMatchEngine implements MatchEngine { ... }
class BasketballRuleEngine implements RuleEngine { ... }
class BasketballScoringEngine implements ScoringEngine { ... }

// 2. Implement SportModule
class BasketballModule implements SportModule { ... }

// 3. Đăng ký
sportRegistry.register(new BasketballModule());
```

---

## 7. Lớp Frontend

| Trang | Route | Mô tả |
|---|---|---|
| Home | `/` | Hero, live matches, top leagues, stats counters |
| Leagues | `/leagues` | 19 giải đấu với filter vùng/loại |
| League Detail | `/leagues/:id` | Standings, teams, fixtures |
| Teams | `/teams` | 44 đội với filter |
| Team Detail | `/teams/:id` | Squad table |
| Players | `/players` | 70 cầu thủ với filter vị trí |
| Player Detail | `/players/:id` | Attribute bars |
| Matches | `/matches` | Live, upcoming, results |
| Match Engine | `/engine` | 2D pitch simulation UI |
| Play | `/play` | User tham gia trận đấu |
| VR Gateway | `/vr` | Roadmap XR |
| Auth | `/login`, `/register` | Đăng nhập/Đăng ký |
| Dashboard | `/dashboard` | Profile người chơi |

---

## 8. Tích hợp Universe main

### Hiện tại
- Sports Universe dùng auth tự triển khai (SHA-256 + localStorage token)
- `user_id` trong bảng sports-universe = `id` từ bảng `users` local

### Kế hoạch tích hợp
```
Phase 4: Thay auth local → Universe main Auth
Phase 4: Kết nối Wallet Universe main → phần thưởng token sau trận
Phase 4: Kết nối Inventory Universe main → trang phục cầu thủ
Phase 4: Kết nối Friends Universe main → thách đấu bạn bè
Phase 4: Kết nối AI Agents → huấn luyện viên AI, phân tích chiến thuật
```

---

## 9. Quyết định kiến trúc đã ghi nhận (ADR)

### ADR-001: Không FK constraint cho external references
**Quyết định:** `user_id`, `avatar_id`, `wallet_id`... là integer/text không có FK constraint.
**Lý do:** Universe main là hệ thống riêng biệt — không thể đảm bảo referential integrity cross-system.
**Hệ quả:** Application code phải tự validate sự tồn tại của user khi cần.

### ADR-002: Giữ legacy tables để backward compat
**Quyết định:** Bảng `leagues`, `teams`, `players`, `matches`, `users` không bị xóa hay đổi tên.
**Lý do:** Tất cả API routes hiện tại phụ thuộc vào chúng. Migration dần dần an toàn hơn.
**Hệ quả:** Tồn tại song song legacy tables và clean Sports Universe tables trong thời gian chuyển đổi.

### ADR-003: SportModule interface pattern
**Quyết định:** Mỗi môn thể thao phải implement đủ SportModule + MatchEngine + RuleEngine + ScoringEngine.
**Lý do:** Đảm bảo mọi môn thể thao đều có behavior nhất quán, dễ test và thay thế.
**Hệ quả:** Không thể thêm môn thể thao "một phần" — phải implement đầy đủ hoặc dùng coming_soon stub.

### ADR-004: Zod v3 bắt buộc
**Quyết định:** Dùng Zod v3 API (`z.string().email()`) — KHÔNG dùng `z.email()`.
**Lý do:** Workspace dùng `zod: ^3.25.76`; API `zod/v4` không khả dụng.
**Hệ quả:** Mọi schema file dùng `import { z } from "zod/v4"` (nội bộ của zod@3) cho drizzle-zod compat.
