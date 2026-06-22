# MASTER_SPEC.md — Sports Universe · AI Dev Kit

> Tài liệu đặc tả tổng thể cho nền tảng Sports Universe.
> Dùng để định hướng phát triển có sự hỗ trợ của AI.

---

## 1. Tổng quan dự án

**Sports Universe** là một **module** bên trong nền tảng **AI Universe**.

AI Universe là nền tảng lớn hơn sở hữu các hệ thống toàn cục dùng chung cho tất cả các module.
Sports Universe chỉ triển khai các tính năng thể thao — không bao giờ tái tạo các hệ thống toàn cục.

### Vị trí trong AI Universe

```
AI Universe (nền tảng chính)
├── User              ← GLOBAL — Universe main sở hữu
├── Avatar            ← GLOBAL — Universe main sở hữu
├── Wallet            ← GLOBAL — Universe main sở hữu
├── Inventory         ← GLOBAL — Universe main sở hữu
├── Friends           ← GLOBAL — Universe main sở hữu
├── AI Agents         ← GLOBAL — Universe main sở hữu
│
└── Modules
    ├── Sports Universe ← Module này
    │   ├── Football    ← Môn thể thao đầu tiên (Active ✅)
    │   ├── Basketball  ← Coming soon 🔜
    │   ├── Tennis      ← Coming soon 🔜
    │   ├── Racing      ← Coming soon 🔜
    │   └── Boxing      ← Coming soon 🔜
    ├── [Module khác trong tương lai]
    └── ...
```

---

## 2. Phạm vi hệ thống

### Sports Universe sở hữu (tạo và quản lý)

| Thực thể | Bảng DB | Mô tả |
|---|---|---|
| SportsProfile | `sports_profiles` | Hồ sơ thể thao toàn cục mỗi user |
| SportStatistics | `sport_statistics` | Thống kê tổng hợp theo môn/user |
| SportAchievements | `sport_achievements` | Huy chương mở khóa |
| FootballProfile | `football_profiles` | Hồ sơ cầu thủ bóng đá |
| FootballLeague | `football_leagues` | Giải đấu bóng đá |
| FootballTeam | `football_teams` | Đội bóng |
| FootballMatch | `football_matches` | Trận đấu |

### Sports Universe KHÔNG sở hữu (tham chiếu từ Universe main)

| Thực thể | Cách tham chiếu | Ghi chú |
|---|---|---|
| User | `user_id: integer` | Không có FK constraint |
| Avatar | `avatar_id: text` (UUID) | Không có FK constraint |
| Wallet | `wallet_id: text` (UUID) | Tham chiếu khi cần thanh toán |
| Inventory | `inventory_id: text` (UUID) | Tham chiếu khi cần vật phẩm |
| Friends | `user_id` (ngầm) | Mạng bạn bè dùng lại qua user_id |
| AI Agents | `agent_id: text` (UUID) | Tham chiếu khi cần AI coach/companion |

---

## 3. Các bên liên quan

| Vai trò | Mô tả |
|---|---|
| Người chơi (Player) | User từ Universe main đăng ký vào Sports Universe |
| Quản trị viên | Quản lý giải đấu, seeds data, monitor |
| AI Agent | Agent từ Universe main hỗ trợ huấn luyện, phân tích |
| Nhà phát triển | Thêm môn thể thao mới theo interface SportModule |

---

## 4. Yêu cầu chức năng

### Phase 1 — Football (Active)
- [x] Xem danh sách giải đấu và bảng xếp hạng
- [x] Xem thông tin đội bóng và cầu thủ
- [x] Mô phỏng trận đấu (Match Engine - Poisson distribution)
- [x] Người chơi tham gia trận đấu, nhận XP và thống kê
- [x] Hệ thống sân 2D trực tiếp với bình luận
- [x] Đăng ký / Đăng nhập (auth tự triển khai trong giai đoạn này)

### Tương lai
- [ ] Tích hợp Wallet Universe main (thanh toán, phần thưởng token)
- [ ] Tích hợp Inventory Universe main (vật phẩm thể thao, trang phục)
- [ ] Tích hợp Friends Universe main (thách đấu bạn bè)
- [ ] Tích hợp AI Agents (huấn luyện viên AI, phân tích chiến thuật)
- [ ] Thêm môn Basketball, Tennis, Racing, Boxing

---

## 5. Yêu cầu phi chức năng

| Yêu cầu | Mô tả |
|---|---|
| Backward compatibility | Không bao giờ phá vỡ API và bảng legacy |
| Không trùng lặp | Không tái tạo User, Avatar, Wallet, Inventory, Friends, AI Agents |
| Mô-đun hóa | Mỗi môn thể thao là một module độc lập implement SportModule |
| TypeScript strict | Toàn bộ code phải typecheck sạch |
| Zod v3 | Dùng z.string().email() — KHÔNG dùng z.email() |

---

## 6. Ràng buộc thiết kế

1. **User là external reference** — `user_id: integer`, không FK constraint
2. **Avatar là external reference** — `avatar_id: text` (UUID string), không FK constraint
3. **Wallet/Inventory/Friends/AI Agents** — tham chiếu qua ID khi cần, không lưu dữ liệu của chúng
4. **API legacy** — tất cả endpoints `/api/leagues`, `/api/teams`, `/api/players`, `/api/matches` không được thay đổi
5. **DB legacy** — bảng `leagues`, `teams`, `players`, `matches`, `users` không được xóa hoặc đổi tên
6. **Sports Engine** — mỗi môn thể thao phải implement đủ 4 interfaces: SportModule, MatchEngine, RuleEngine, ScoringEngine

---

## 7. Từ điển thuật ngữ

| Thuật ngữ | Định nghĩa |
|---|---|
| Universe main | Nền tảng AI Universe sở hữu các hệ thống toàn cục |
| Sports Universe | Module thể thao bên trong AI Universe |
| SportModule | Interface top-level cho một môn thể thao |
| MatchEngine | Interface mô phỏng kết quả trận đấu |
| RuleEngine | Interface quy tắc của môn thể thao |
| ScoringEngine | Interface tính điểm và xếp hạng |
| sportRegistry | Singleton đăng ký tất cả SportModule |
| External reference | ID tham chiếu đến thực thể của hệ thống khác (không FK) |
| Legacy table | Bảng DB cũ giữ lại để backward compatibility |
