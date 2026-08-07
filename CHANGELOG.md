# Changelog

## v0.11.0 — 2026-08-08

### Shopee Affiliate Foundation
- Tăng version `0.10.2` → `0.11.0`.
- Chuẩn hóa `data/affiliate.json` với cờ `enabled`, `provider`, `settings`, banner metadata, campaign ID, CTA, category targeting và products.
- Mặc định toàn bộ affiliate vẫn **tắt**; không chèn link Shopee giả hoặc campaign giả.
- Banner/product chỉ hiển thị khi global `enabled=true`, item hợp lệ và URL là HTTP(S).
- Affiliate có thể target theo category; `categories: []` nghĩa là dùng cho mọi danh mục.
- Tất cả affiliate link tiếp tục dùng `rel="sponsored nofollow noopener"`.
- Disclosure chỉ hiển thị khi thực sự có banner/product affiliate đang hoạt động.

### Affiliate UI/UX
- Nâng `assets/js/app.js` để validate affiliate URL/image trước khi render.
- Hỗ trợ banner image, product badge, CTA, priceLabel, placeholder khi chưa có ảnh.
- Giới hạn số product hiển thị bằng `settings.maxProducts`.
- Thêm event `affiliateclick` và hỗ trợ đẩy `affiliate_click` vào `window.dataLayer` nếu website tích hợp analytics sau này; không thêm tracker bên thứ ba mặc định.
- Thêm `assets/css/affiliate-v0.11.0.css` để polish banner/product desktop/mobile mà không redesign website.
- `assets/css/brand-v0.9.0.css` import stylesheet affiliate mới để không cần thay đổi markup hiện tại.

### Commits
- `6b86e2469f26783a1367f18acff5a632263c2868` — build Shopee affiliate rendering foundation.
- `863cb7d6c112253a28f1b7d228be6adb3c87222d` — normalize affiliate data schema.
- `eb3070133b2775b94f77c6319bce3e3d5712e652` — add affiliate UI stylesheet.
- `cf08e14e8689f0b477d5fbf0aeb77d163ccd055f` — load affiliate stylesheet.
- `bb46368098205de43f50ff0da2a19afe489eface` — bump config to v0.11.0.

### Pending
- Chưa có Shopee Affiliate banner/link/product thật, nên UI affiliate vẫn tự ẩn.
- Bước tiếp theo là nhập campaign/link thật vào `data/affiliate.json` và kiểm tra placement/click behavior trên live site.

## v0.10.2 — 2026-08-08

### YouTube Empty/Unavailable Playlist Handling
- Tăng version `0.10.1` → `0.10.2`.
- Phân tích trực tiếp GitHub Actions run `31226005073` / `Sync YouTube #4`.
- Xác nhận `YOUTUBE_API_KEY` đã được workflow nhận; lỗi không nằm ở Secret.
- Root cause: bước `Sync channel data` nhận `YouTube API 404`, reason `playlistNotFound` khi đọc playlist bằng `playlistItems.list`.
- `scripts/sync-youtube.mjs` giờ parse metadata lỗi YouTube API (`status`, `reason`, message) thay vì chỉ ném raw text.
- Thêm helper nhận diện `404 / playlistNotFound` và trả về danh sách rỗng cho playlist không tồn tại/chưa khả dụng.
- Nếu uploads playlist của channel chưa khả dụng, sync tiếp tục với `0 video` thay vì fail.
- Nếu một playlist category bị xóa/không khả dụng, chỉ bỏ qua playlist đó và tiếp tục các playlist còn lại.
- Các lỗi API khác vẫn tiếp tục throw để không che giấu lỗi thật.

### Expected Behavior
- Channel chưa có video: vẫn ghi được metadata thật vào `data/channel.json`; `data/videos.json` có thể rỗng; website tiếp tục Demo Mode.
- Khi video public đầu tiên xuất hiện, lần sync kế tiếp sẽ lấy video, commit dữ liệu và deploy Pages theo pipeline v0.10.x.

### Commits
- `a0534633af2d7e1c8987d6dc134d3aee18c05814` — handle unavailable YouTube playlists.
- `4baa71df974219c17f8f3ae849450d9b06ff8048` — bump config to v0.10.2.
- `bfa72d0adb392bff222398951ae23e7424e5ab28` — document v0.10.2 behavior in README.

### Verification Status
- Source readback confirmed v0.10.2 changes are on `main`.
- Push trigger should automatically start a new `Sync YouTube` validation run because `scripts/sync-youtube.mjs` and `config/site.json` are included in workflow path filters.
- Final end-to-end status must be confirmed from the new Actions run or updated `data/channel.json`; do not infer success from source changes alone.

## v0.10.1 — 2026-08-08

### Validation Trigger
- Tăng version `0.10.0` → `0.10.1`.
- Người quản trị đã xác nhận tạo GitHub Actions repository secret `YOUTUBE_API_KEY`.
- Thêm trigger `push` có giới hạn path cho workflow `Sync YouTube` để tự chạy khi các file cấu hình/sync thay đổi trên `main`:
  - `.github/workflows/sync-youtube.yml`
  - `scripts/sync-youtube.mjs`
  - `config/site.json`
  - `data/categories.json`
- Mục đích: tự kích hoạt validation end-to-end sau thay đổi cấu hình mà không cần phụ thuộc vào thao tác `workflow_dispatch` từ connector.
- Lịch chạy mỗi 6 giờ và chạy thủ công vẫn được giữ nguyên.

### Commits
- `78544e11fc572885a5ae51fedf6c5e7277e5c6b1` — bump config to v0.10.1.
- `13ea4166d6dd3f4232841956ae1eeeefafd56d9b` — add auto-validation push trigger to Sync YouTube workflow.
- `0af64eeb9109124d21eb810894c54db656cb59b7` — update README for v0.10.1 validation state.

### Verification Status
- GitHub source readback PASS for v0.10.1 config/workflow.
- Immediately after trigger commit, `data/channel.json` was still unchanged (`syncedAt: null`, `id: null`), so the YouTube API run had not yet been proven successful at that check point.
- Current GitHub connector does not expose generic push-triggered workflow run listing/dispatch, and runtime web access to the Actions page is unavailable due cache limitations.
- Do not mark YouTube sync or Pages deploy as successful until `data/channel.json` readback or an Actions run provides evidence.

## v0.10.0 — 2026-08-08

### YouTube Live Integration
- Nâng `config/site.json` từ `0.9.0` lên `0.10.0`.
- Nâng `scripts/sync-youtube.mjs` để so sánh dữ liệu cũ/mới trước khi ghi file.
- Không còn tạo commit chỉ vì trường `syncedAt` thay đổi.
- Chỉ cập nhật `data/videos.json`, `data/channel.json` hoặc `data/categories.json` khi nội dung tương ứng thực sự thay đổi.
- Giữ cơ chế resolve Channel ID bằng YouTube handle, lấy uploads playlist, metadata/statistics và Playlist → Category.
- Demo Mode tiếp tục tự tắt khi có video thật trong `data/videos.json`.

### GitHub Actions
- Nâng `.github/workflows/sync-youtube.yml` thành pipeline end-to-end: **Sync → commit data → build Pages → deploy Pages**.
- Không còn phụ thuộc vào commit do `GITHUB_TOKEN` tạo ra để kích hoạt workflow deploy thứ hai.
- Thêm quyền `pages: write` và `id-token: write` cho workflow Sync YouTube để deploy Pages trực tiếp.
- Nếu repository secret `YOUTUBE_API_KEY` chưa tồn tại, workflow sẽ skip phần sync một cách sạch thay vì fail theo lịch mỗi 6 giờ.
- Chỉ build/deploy Pages trong workflow Sync YouTube khi dữ liệu YouTube thực sự thay đổi.
- Workflow deploy source thông thường `.github/workflows/deploy-pages.yml` vẫn giữ nguyên cho các push source lên `main`.

### Documentation
- README cập nhật kiến trúc v0.10.0 và quy trình bật `YOUTUBE_API_KEY`.
- Ghi rõ GitHub connector hiện không expose API quản lý repository secrets; secret phải tạo trong GitHub Settings → Secrets and variables → Actions.

### GitHub commits
- `a0b7e9c141114d3e69e96bc376b8f4b59857d482` — bump site config to v0.10.0.
- `472010f6acddccb0c47f7d1ae64257763fbd7238` — avoid no-op YouTube sync commits.
- `3f927d1d90a5a03a01b928173cad5148edf01357` — sync YouTube and deploy Pages in one workflow.
- `beb4bfab1a4a798192fbe6059127a0dc68182e8b` — document YouTube live integration.

### Verification / Pending
- GitHub connector read/write trên `main` hoạt động bình thường.
- `data/videos.json` hiện vẫn rỗng và `data/channel.json` vẫn ở trạng thái chưa sync thật.
- Connector không cung cấp thao tác đọc/tạo repository secret nên chưa thể xác nhận `YOUTUBE_API_KEY` đã được cấu hình.
- Cần tạo secret và chạy `Sync YouTube` thủ công lần đầu để test end-to-end với YouTube Data API.
- Runtime hiện không thể xác minh Pages qua public URL do hạn chế DNS/cache; không ghi nhận deploy v0.10.0 là Success khi chưa có bằng chứng Actions/live readback.

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
- Modal player privacy-enhanced `youtube-nocookie.com`, chỉ load iframe khi click.
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
