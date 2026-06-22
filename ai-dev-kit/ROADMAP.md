# ROADMAP.md — Sports Universe · AI Dev Kit

> Lộ trình phát triển nền tảng Sports Universe bên trong AI Universe.
> Mỗi giai đoạn liệt kê mục tiêu, tính năng, và tiêu chí hoàn thành.

---

## Trạng thái hiện tại

| Module | Trạng thái | Ghi chú |
|---|---|---|
| Football (Bóng đá) | ✅ Active | Môn thể thao đầu tiên |
| Basketball (Bóng rổ) | 🔜 Coming soon | Interface stub đã sẵn sàng |
| Tennis (Quần vợt) | 🔜 Coming soon | Interface stub đã sẵn sàng |
| Racing (Đua xe) | 🔜 Coming soon | Interface stub đã sẵn sàng |
| Boxing (Quyền anh) | 🔜 Coming soon | Interface stub đã sẵn sàng |

---

## Phase 1 — Football Universe ✅ (Hoàn thành)

Nền tảng bóng đá với 19 giải đấu, 44 đội, 70+ cầu thủ.

### Đã hoàn thành
- [x] 19 giải đấu toàn cầu (Europa, Asia, Americas, Africa, International)
- [x] 44 đội bóng với màu sắc và sân vận động
- [x] 70+ cầu thủ với đầy đủ thuộc tính (pace, shooting, passing, dribbling, defending, physical)
- [x] Match Engine (Poisson distribution) — mô phỏng trận đấu tự động
- [x] User tham gia trận đấu — nhận XP, level up, stamina
- [x] Sân 2D trực tiếp với bình luận tiếng Việt
- [x] Bảng xếp hạng giải đấu (standings)
- [x] Hệ thống auth (đăng ký / đăng nhập)
- [x] Dashboard người chơi với stats và achievements hiển thị
- [x] VR Gateway (roadmap Phase 5)
- [x] Kiến trúc Sports Engine (SportModule, MatchEngine, RuleEngine, ScoringEngine interfaces)
- [x] Schema Sports Universe (7 bảng sạch, tách biệt legacy)

---

## Phase 2 — Sports Universe Foundation 🚧

Chuẩn bị nền tảng để mở rộng sang nhiều môn thể thao.

### Mục tiêu
- [ ] Sports Universe gateway page — hiển thị tất cả môn (active + coming soon)
- [ ] SportsProfile API endpoints — tạo/lấy hồ sơ thể thao toàn cục
- [ ] SportStatistics API — thống kê per-sport per-user
- [ ] SportAchievements API — mở khóa và hiển thị huy chương
- [ ] Football Profile API — profile cầu thủ bóng đá riêng (tách khỏi user table)
- [ ] Populating `MASTER_SPEC.md`, `ARCHITECTURE.md`, `ROADMAP.md` đầy đủ (✅ đang làm)

---

## Phase 3 — Multi-Sport Expansion

Triển khai các môn thể thao tiếp theo.

### Thứ tự ưu tiên
1. **Basketball** — gần nhất với football (team sport, standings)
2. **Tennis** — individual, khác biệt về scoring
3. **Racing** — individual, position-based scoring
4. **Boxing** — individual, round-based

### Cho mỗi môn thể thao mới
- [ ] Implement `BasketballMatchEngine` implements `MatchEngine`
- [ ] Implement `BasketballRuleEngine` implements `RuleEngine`
- [ ] Implement `BasketballScoringEngine` implements `ScoringEngine`
- [ ] Implement `BasketballModule` implements `SportModule`
- [ ] Thêm bảng DB: `basketball_profiles`, `basketball_leagues`, `basketball_teams`, `basketball_matches`
- [ ] API endpoints mới (cập nhật OpenAPI spec trước)
- [ ] Frontend pages mới
- [ ] Đăng ký vào `sportRegistry`

---

## Phase 4 — AI Universe Integration

Kết nối đầy đủ với Universe main — tái sử dụng tất cả global systems.

### Mục tiêu

| Hệ thống | Tích hợp |
|---|---|
| User | Thay auth local → Universe main Auth |
| Avatar | Hiển thị avatar Universe main trong hồ sơ cầu thủ |
| Wallet | Phần thưởng token sau trận thắng |
| Inventory | Trang phục cầu thủ, vật phẩm thể thao |
| Friends | Thách đấu bạn bè, bảng xếp hạng giữa bạn bè |
| AI Agents | Huấn luyện viên AI, phân tích chiến thuật, dự đoán kết quả |

### Nguyên tắc bất biến
- `user_id` luôn là external reference (integer, không FK)
- `avatar_id` luôn là external reference (text UUID, không FK)
- Không bao giờ tạo bảng User, Avatar, Wallet, Inventory, Friends, AI Agents trong Sports Universe

---

## Phase 5 — XR / Immersive

Trải nghiệm sân vận động ảo thực tế.

> Tham khảo chi tiết: `tientrinhhethong.md`

### Mục tiêu
- [ ] Phase 5.1 — Web 3D Stadium (Three.js) ✅ cơ bản đã có
- [ ] Phase 5.2 — WebXR VR Stadium (Oculus, Vision Pro)
- [ ] Phase 5.3 — AR Stats Overlay (mobile)
- [ ] Phase 5.4 — Full XR với AI Agents làm bình luận viên ảo

---

## Ghi chú ưu tiên

- **Không bao giờ** phá vỡ API và bảng legacy
- **Không bao giờ** tái tạo User, Avatar, Wallet, Inventory, Friends, AI Agents
- Mỗi Phase mới phải **extend**, không **rewrite**
- Tất cả môn thể thao mới phải implement đầy đủ 4 interfaces của Sports Engine
