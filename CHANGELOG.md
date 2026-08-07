# Changelog

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
