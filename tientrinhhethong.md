# 🌍 VŨ TRỤ BÓNG ĐÁ ẢO — TIẾN TRÌNH HỆ THỐNG

> **Auto-tick:** File này tự cập nhật khi agent hoàn thành từng chức năng.  
> Cập nhật lần cuối: 2026-06-21

---

## 📊 TỔNG QUAN TIẾN ĐỘ

| Giai đoạn | Mô tả | Trạng thái | Tiến độ |
|-----------|-------|------------|---------|
| Phase 1 | Nền tảng Web App | 🔄 Đang xây dựng | 40% |
| Phase 2 | Hệ thống Giải đấu & Đội bóng | ⏳ Chờ | 0% |
| Phase 3 | Mô phỏng Trận đấu | ⏳ Chờ | 0% |
| Phase 4 | VR/AR/XR Integration | ⏳ Chờ | 0% |
| Phase 5 | Multiplayer & Esports | ⏳ Chờ | 0% |

---

## 🚀 PHASE 1 — NỀN TẢNG WEB APP

### 1.1 Backend & Cơ sở hạ tầng
- [x] Khởi tạo project (pnpm monorepo, TypeScript, Express 5)
- [x] Cấu hình PostgreSQL + Drizzle ORM
- [x] Thiết kế OpenAPI spec (endpoints: auth, leagues, teams, players, matches, stats)
- [x] Chạy codegen (React Query hooks + Zod schemas)
- [ ] Xây dựng DB schema (users, leagues, teams, players, matches, events)
- [ ] Implement API routes (auth, leagues, teams, players, matches, stats)
- [ ] Seed dữ liệu ban đầu (giải đấu, đội bóng, cầu thủ)

### 1.2 Frontend Web App
- [ ] Trang chủ / Landing page (hero, stats overview, live matches)
- [ ] Trang đăng ký / đăng nhập tài khoản
- [ ] Dashboard người dùng (sau khi đăng nhập)
- [ ] Trang danh sách Giải đấu (lọc theo khu vực, loại)
- [ ] Trang chi tiết Giải đấu (bảng xếp hạng, vua phá lưới, lịch đấu)
- [ ] Trang danh sách Đội bóng (tìm kiếm, lọc)
- [ ] Trang chi tiết Đội bóng (cầu thủ, lịch sử, thống kê)
- [ ] Trang chọn CLB tham gia (user chọn đội mình muốn đại diện)
- [ ] Trang chi tiết Cầu thủ (thông số, phong độ)
- [ ] Trang Lịch thi đấu / Kết quả
- [ ] Trang chi tiết Trận đấu (events, timeline)
- [ ] Profile người dùng (thành tích, đội đang đại diện)

---

## 🏆 PHASE 2 — DỮ LIỆU GIẢI ĐẤU & ĐỘI BÓNG

### 2.1 Dữ liệu Giải đấu (15+ giải)

**Châu Âu:**
- [ ] Premier League (Anh) — 20 đội
- [ ] La Liga (Tây Ban Nha) — 20 đội
- [ ] Bundesliga (Đức) — 18 đội
- [ ] Serie A (Ý) — 20 đội
- [ ] Ligue 1 (Pháp) — 18 đội
- [ ] UEFA Champions League — 32 đội
- [ ] UEFA Europa League — 24 đội

**Châu Á:**
- [ ] V.League 1 (Việt Nam) — 14 đội
- [ ] J1 League (Nhật Bản) — 18 đội
- [ ] K League 1 (Hàn Quốc) — 12 đội
- [ ] Chinese Super League (Trung Quốc) — 16 đội
- [ ] AFC Champions League — 24 đội

**Châu Mỹ:**
- [ ] MLS (Mỹ) — 29 đội
- [ ] Copa Libertadores (Nam Mỹ) — 32 đội
- [ ] Brasileirão (Brazil) — 20 đội
- [ ] Liga MX (Mexico) — 18 đội

**Châu Phi & Các khu vực khác:**
- [ ] CAF Champions League (Châu Phi) — 16 đội
- [ ] Saudi Pro League (Trung Đông) — 18 đội
- [ ] A-League (Úc) — 12 đội

**Đội tuyển Quốc gia:**
- [ ] FIFA World Cup Groups — 32 ĐTQG
- [ ] AFC Asian Cup — 24 ĐTQG
- [ ] UEFA Nations League — 55 ĐTQG
- [ ] Copa América — 16 ĐTQG

### 2.2 Dữ liệu Cầu thủ
- [ ] Nhập dữ liệu cầu thủ thực (kiểm tra bản quyền từng tên)
- [ ] Xử lý tên cầu thủ: giữ nguyên nếu an toàn, đổi nếu cần
- [ ] Thông số cầu thủ (pace, shooting, passing, dribbling, defending, physical)
- [ ] Avatar/ảnh đại diện cầu thủ (generated AI hoặc icon)
- [ ] Cập nhật thống kê theo mùa giải

---

## ⚽ PHASE 3 — MÔ PHỎNG TRẬN ĐẤU

### 3.1 Engine mô phỏng (Web-based)
- [ ] Thuật toán mô phỏng trận đấu dựa trên chỉ số cầu thủ
- [ ] Hệ thống sự kiện trận đấu (bàn thắng, thẻ phạt, thay người)
- [ ] 2D match visualization (pitch view, real-time events)
- [ ] Bảng điều khiển chiến thuật (đội hình, sơ đồ chiến thuật)
- [ ] Hệ thống bình luận tự động (text-based commentary)

### 3.2 Gameplay User
- [ ] User chọn vị trí thi đấu (GK, CB, MF, ST...)
- [ ] Hệ thống chỉ số cầu thủ user (tăng theo thành tích)
- [ ] Tham gia trận đấu (mini-game web-based)
- [ ] Bảng thành tích cá nhân (goals, assists, rating)
- [ ] Hệ thống thể lực / mệt mỏi

---

## 🥽 PHASE 4 — VR/AR/XR INTEGRATION

> ⚠️ **Yêu cầu thiết bị:** Kính VR (Meta Quest, PlayStation VR, Apple Vision Pro, v.v.)

### 4.1 WebXR Foundation
- [ ] Tích hợp WebXR API (truy cập qua trình duyệt VR)
- [ ] 3D sân bóng (Three.js / Babylon.js)
- [ ] Avatar cầu thủ 3D (voxel hoặc low-poly)
- [ ] Controller mapping (đá bóng bằng tay cầm VR)
- [ ] Spatial audio (âm thanh sân bóng 3D)

### 4.2 AR Mode (điện thoại / kính AR)
- [ ] AR overlay thống kê trận đấu (chỉ số cầu thủ hiển thị trên sân)
- [ ] ARKit/ARCore integration
- [ ] Hand tracking (cử chỉ tay điều khiển)

### 4.3 MR/XR Full Experience
- [ ] Bước vào sân bóng ảo (full immersion)
- [ ] Chạy, di chuyển trong không gian 3D
- [ ] Multiplayer VR (nhiều người cùng vào sân)
- [ ] Khán đài khán giả ảo

---

## 🌐 PHASE 5 — MULTIPLAYER & ESPORTS

### 5.1 Multiplayer Online
- [ ] Hệ thống phòng đấu (create/join room)
- [ ] Matchmaking (ghép đôi theo rating)
- [ ] Real-time WebSocket gameplay
- [ ] Spectator mode (xem người khác chơi)
- [ ] Voice chat trong phòng đấu

### 5.2 Esports & Giải đấu Chính thức
- [ ] Tổ chức giải đấu online (tự động lịch đấu)
- [ ] Bảng xếp hạng toàn cầu (ELO rating)
- [ ] Transfer market (mua bán cầu thủ user)
- [ ] Fantasy Football mode
- [ ] Huy hiệu / danh hiệu thành tích

### 5.3 Cộng đồng
- [ ] Feed hoạt động (ai ghi bàn, ai vô địch)
- [ ] Hệ thống club/guild user-created
- [ ] Comment & reaction trận đấu
- [ ] Highlight reel tự động

---

## 📋 NHẬT KÝ CẬP NHẬT

| Ngày | Chức năng hoàn thành | Ghi chú |
|------|---------------------|---------|
| 2026-06-21 | Khởi tạo project, OpenAPI spec, codegen | Phase 1 bắt đầu |
| | | |

---

## 🗒️ GHI CHÚ BẢN QUYỀN CẦU THỦ

Tên cầu thủ **ĐƯỢC GIỮ NGUYÊN** (tên cá nhân không bị bảo hộ bản quyền):
- Tên thật của cầu thủ là thông tin công cộng
- Không sử dụng ảnh chính thức, hình đại diện được cấp phép
- Không sử dụng logo CLB chính thức (tạo logo tương tự)
- Thống kê/chỉ số là dữ liệu hư cấu (không clone FIFA/PES)

Tên cầu thủ **CẦN ĐỔI** (nếu có thỏa thuận độc quyền):
- Một số cầu thủ có thỏa thuận hình ảnh độc quyền với EA Sports / Konami
- Em sẽ đánh dấu và đổi tên những trường hợp này trong quá trình seed data

---

*File này được quản lý tự động bởi hệ thống. Đừng chỉnh sửa thủ công phần checkbox.*
