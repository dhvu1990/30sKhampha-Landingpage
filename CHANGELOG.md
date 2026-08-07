# Changelog

## v0.9.0 — 2026-08-08

### Branding
- Đưa brand mark chính thức của **30s KHÁM PHÁ** lên website từ asset `watermark (1).png` trong Google Drive Branding.
- Thêm `assets/brand/brand-mark.svg`; SVG wrapper giữ nguyên PNG nền trong suốt để dùng ổn định trên static GitHub Pages.
- Header đổi từ wordmark text tạm `30s KHÁM PHÁ` sang **brand mark thật + chữ Unicode `KHÁM PHÁ`** bằng Be Vietnam Pro.
- Footer dùng cùng brand mark và wordmark với header.
- Thêm favicon và Web App Manifest icon từ cùng brand mark.
- Demo Mode thêm watermark brand mark nhẹ trên thumbnail mẫu.

### UI Polish
- Thêm `assets/css/brand-v0.9.0.css` để tinh chỉnh riêng kích thước, spacing và responsive logo desktop/mobile mà không redesign toàn bộ UI.
- Giữ nguyên brand palette: Paper Cream, Brick Red, Charcoal Black, Mustard Yellow, Muted Teal.
- Giữ tagline chính thức **HIỂU NHANH TRONG 30 GIÂY** và chuẩn hóa tên hiển thị thành **30s KHÁM PHÁ**.

### Changed
- `config/site.json`: tăng version `0.8.2` → `0.9.0`, chuẩn hóa `siteName` và `tagline`.
- `index.html`: brand header/footer, favicon, manifest và stylesheet branding v0.9.0.
- `manifest.webmanifest`: thêm brand icon.
- `README.md`: cập nhật v0.9.0, branding source-of-truth và bước tiếp theo v0.10.x.

### GitHub commits
- `81dcafba58e1a81e2c3062bb74038e11d36c2dd1` — bump site config to v0.9.0.
- `5d030ecfbbcf8211c0bd0c5fb12d441a507368a4` — add official brand mark asset.
- `971f5e53f4ee928dd5e7bc79a832c1ac289b87b3` — brand spacing + Demo thumbnail polish.
- `072358d8ea5cff20faf02d28da9962e53c40d4f2` — apply official branding to live UI.
- `69456f4d064947fb318634537a874291a30271c6` — add brand icon to web manifest.
- `6913d32322f9d63ebef6b0f18378c465216b4a68` — update README for v0.9.0.

### Notes
- GitHub connector đã được xác minh có quyền `push/admin` và toàn bộ thay đổi source được ghi trực tiếp lên branch `main`.
- Runtime không có `gh` CLI và không có outbound network trong container; source vẫn được cập nhật an toàn qua GitHub connector.
- Bước tiếp theo sau khi xác nhận branding live ổn định: **v0.10.x — YouTube live integration hoàn chỉnh**.

## v0.8.2 — 2026-08-07

### Changed
- Xác nhận repository đã Public.
- Bật GitHub Pages với Source = GitHub Actions.
- GitHub Pages deploy thành công tại `https://dhvu1990.github.io/30sKhampha-Landingpage/`.
- Run deploy thành công đầu tiên: `Deploy GitHub Pages #6`, tổng thời gian 32s.
- Build và Deploy đều `success`.
- Deployment commit: `20f9d47ad3ff82ce57e624d14b13a8c408e7911d`.
- README cập nhật trạng thái LIVE.

### Notes
- GitHub Actions hiện hiển thị warning Node.js 20 deprecated cho một số action; workflow vẫn chạy thành công và GitHub tự ép chạy trên Node.js 24. Đây chưa phải lỗi chặn deploy.
- Bước kế tiếp: v0.9.0 rà soát UI/UX website live trên desktop/mobile và chuẩn bị tích hợp YouTube thật.

## v0.8.0 — 2026-08-07

### Added
- GitHub Pages deployment workflow tại `.github/workflows/deploy-pages.yml`.
- Auto deploy khi push lên branch `main` và hỗ trợ `workflow_dispatch`.
- Pages artifact chỉ publish `index.html`, `manifest.webmanifest`, `robots.txt`, `assets/`, `config/`, `data/`.
- `.nojekyll` được tạo trong artifact deploy để phục vụ static site trực tiếp.

### Changed
- Tăng version website lên `0.8.0`.
- README cập nhật kiến trúc GitHub Pages.

### Notes
- Workflow dùng `actions/configure-pages@v5`, `actions/upload-pages-artifact@v4`, `actions/deploy-pages@v4`.
- `YOUTUBE_API_KEY` vẫn chưa được cấu hình trong GitHub Actions Secret.

## v0.7.0 — 2026-08-07

### Changed
- Chuyển hoàn toàn sang static landing page, không WordPress/CMS.
- Khóa YouTube handle `@30sKhamPhaCuocSong` trong config.
- Branding header dùng text HTML để đảm bảo tiếng Việt chính xác; asset logo gốc được quản lý tại Google Drive dự án.

### Added
- Demo mode tự động khi channel chưa có video.
- Search video realtime.
- Filter theo category.
- Category sections tự sinh.
- Grid/List view.
- Featured video tự động.
- Modal player privacy-enhanced `youtube-nocookie.com`.
- Web Share/copy-link.
- Responsive mobile menu.
- Affiliate banner/product-card config.
- Empty/loading states.
- GitHub Actions sync mỗi 6 giờ.
- Resolve Channel ID trực tiếp từ YouTube handle bằng `channels.list(forHandle=...)`.
- Playlist-to-category tự động và auto-category cho playlist chưa map.
- Channel statistics cache trong `data/channel.json`.

### Pending
- Chưa có YouTube video thật để test live sync.
- Chưa cấu hình GitHub secret `YOUTUBE_API_KEY`.
- Chưa có link/banner Shopee Affiliate thật.
- Web-optimized binary brand icon sẽ được bổ sung sau; hiện wordmark web dùng Unicode HTML chính xác.
