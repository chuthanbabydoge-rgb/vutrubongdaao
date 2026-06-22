# ARCHITECTURE.md — Sports Universe · AI Dev Kit

> Tài liệu kiến trúc kỹ thuật cho nền tảng Sports Universe.
> Mô tả cấu trúc hệ thống, các thành phần, và mối quan hệ giữa chúng.

---

## 1. Tổng quan kiến trúc

<!-- Sơ đồ tổng thể (text hoặc ASCII art) -->

_TODO: Điền tổng quan kiến trúc._

---

## 2. Cấu trúc monorepo

```
workspace/
├── artifacts/
│   ├── api-server/          # Backend Express
│   └── football-universe/   # Frontend React + Vite
├── lib/
│   ├── db/                  # Drizzle ORM + PostgreSQL schema
│   ├── api-spec/            # OpenAPI spec (nguồn sự thật)
│   ├── api-client-react/    # Generated TanStack Query hooks
│   ├── api-zod/             # Generated Zod schemas
│   └── sports-engine/       # Interfaces + implementations (SportModule, MatchEngine, ...)
├── scripts/                 # Seed, migration utilities
└── ai-dev-kit/              # Tài liệu phát triển AI (thư mục này)
```

---

## 3. Stack công nghệ

<!-- Chi tiết về từng công nghệ được sử dụng -->

_TODO: Điền stack công nghệ._

---

## 4. Lớp Database

<!-- Schema, quan hệ bảng, chiến lược migration -->

_TODO: Điền kiến trúc database._

---

## 5. Lớp API

<!-- REST endpoints, OpenAPI spec, auth flow -->

_TODO: Điền kiến trúc API._

---

## 6. Lớp Sports Engine

<!-- SportModule, MatchEngine, RuleEngine, ScoringEngine interfaces -->

_TODO: Điền kiến trúc sports engine._

---

## 7. Lớp Frontend

<!-- Routing, state management, component structure -->

_TODO: Điền kiến trúc frontend._

---

## 8. Tích hợp Universe main

<!-- Cách Sports Universe kết nối với AI Universe platform -->

_TODO: Điền chiến lược tích hợp Universe main._

---

## 9. Quyết định kiến trúc đã ghi nhận (ADR)

<!-- Architecture Decision Records -->

_TODO: Thêm ADR khi có quyết định quan trọng._
