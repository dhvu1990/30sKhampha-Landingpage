# Changelog

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
