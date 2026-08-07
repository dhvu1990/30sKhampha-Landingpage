# 30s Khám Phá — Landing Page

Phiên bản: **v0.8.2**

Website static một trang, không WordPress/CMS. Video tự đồng bộ từ YouTube.

## Website live

- GitHub Pages: `https://dhvu1990.github.io/30sKhampha-Landingpage/`
- Trạng thái: **LIVE**
- Deploy workflow: `.github/workflows/deploy-pages.yml`

## Kênh YouTube

- Handle: `@30sKhamPhaCuocSong`
- URL: `https://www.youtube.com/@30sKhamPhaCuocSong`

## Kiến trúc

```text
YouTube
   ↓ YouTube Data API
GitHub Actions (mỗi 6 giờ)
   ↓
data/videos.json + data/channel.json
   ↓
Static HTML/CSS/JS
   ↓
GitHub Pages
```

Không có API key trong JavaScript frontend. `YOUTUBE_API_KEY` chỉ nằm trong GitHub Actions Secret.

## GitHub Pages

Workflow `.github/workflows/deploy-pages.yml` tự deploy khi có thay đổi trên branch `main` và hỗ trợ chạy thủ công.

Artifact public chỉ gồm:
- `index.html`
- `manifest.webmanifest`
- `robots.txt`
- `assets/`
- `config/`
- `data/`

Các thư mục tooling như `scripts/`, `.github/` và tài liệu repository không được đưa vào website.

Repository hiện là **Public**. GitHub Pages được bật với **Source = GitHub Actions**.

Run deploy thành công đầu tiên sau khi bật Pages: run `#6`, deployment commit `20f9d47ad3ff82ce57e624d14b13a8c408e7911d`.

## Chế độ khi kênh chưa có video

`config/site.json` đặt `demoWhenEmpty: true`.

Khi `data/videos.json` chưa có video, website hiển thị dữ liệu mẫu có nhãn **MẪU GIAO DIỆN** để kiểm tra đầy đủ UX. Ngay sau lần sync có video thật, dữ liệu mẫu tự biến mất.

## Tính năng hiện tại

- Static landing/content page, không CMS.
- Mobile-first, responsive.
- Header sticky + mobile menu.
- Search toàn bộ video.
- Lọc theo category/playlist.
- Category chips cuộn ngang trên mobile.
- Featured video tự chọn video mới nhất.
- Video grid/list view.
- Modal YouTube dùng `youtube-nocookie.com`, chỉ load iframe khi click.
- Chia sẻ video qua Web Share API hoặc copy link.
- Demo mode tự động khi kênh trống.
- Affiliate banner + product cards đọc từ `data/affiliate.json`.
- Affiliate link dùng `rel="sponsored nofollow noopener"`.
- Không popup quảng cáo, không sticky Shopee che nội dung.
- Back-to-top, empty state, loading state.
- YouTube sync bằng handle, không cần hard-code Channel ID.
- Playlist tự map thành category; playlist lạ tự tạo category mới.
- GitHub Actions sync mỗi 6 giờ + chạy thủ công.
- GitHub Pages auto deploy từ `main`.

## Bật đồng bộ YouTube

1. Tạo YouTube Data API v3 key trong Google Cloud.
2. GitHub repository → Settings → Secrets and variables → Actions.
3. Tạo secret: `YOUTUBE_API_KEY`.
4. Chạy workflow `Sync YouTube` thủ công lần đầu.

Script dùng `channels.list(forHandle=...)` để tự resolve Channel ID từ handle.

## Affiliate

Sửa `data/affiliate.json` khi có campaign/link Shopee. Nếu `enabled=false` hoặc URL trống, khu vực quảng cáo tự ẩn.

## Branding

Wordmark web dùng Unicode HTML `30s KHÁM PHÁ` để đảm bảo dấu tiếng Việt chính xác. Asset logo gốc/production được quản lý tại Google Drive dự án và sẽ đưa vào repo dạng web-optimized khi chốt asset binary.

Palette chính thức:
- Paper Cream `#F4E8D3`
- Brick Red `#A94335`
- Charcoal Black `#252525`
- Mustard Yellow `#D6A33A`
- Muted Teal `#478784`

## Quản lý dự án

- **Source-of-truth:** GitHub repository này, branch `main`.
- **Tài nguyên / tài liệu / nhật ký / backup:** Google Drive folder `1T4jul5aiUZ4m-9yBExrVx_IkU79uZd0q`.
- Brand source tham chiếu: Google Drive folder `19FGsfgmmajtaRi5nV5w_6FspKMVdxTL_`.
- Mỗi lần chỉnh sửa dự án/source phải tăng version.
