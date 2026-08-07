# 30s KHÁM PHÁ — Landing Page

Phiên bản: **v0.11.0**

Website static một trang, không WordPress/CMS. Video tự đồng bộ từ YouTube.

## Website live

- GitHub Pages: `https://dhvu1990.github.io/30sKhampha-Landingpage/`
- Trạng thái nền tảng: **LIVE từ mốc v0.8.2**
- Deploy source thông thường: `.github/workflows/deploy-pages.yml`
- YouTube sync + deploy dữ liệu mới: `.github/workflows/sync-youtube.yml`

## Kênh YouTube

- Handle: `@30sKhamPhaCuocSong`
- URL: `https://www.youtube.com/@30sKhamPhaCuocSong`

## Kiến trúc

```text
YouTube
   ↓ YouTube Data API
GitHub Actions Sync YouTube (mỗi 6 giờ / thủ công / thay đổi cấu hình sync)
   ↓
data/videos.json + data/channel.json + data/categories.json
   ↓ nếu dữ liệu thực sự thay đổi
Commit dữ liệu + Build Pages + Deploy Pages
   ↓
Static HTML/CSS/JS
   ↓
GitHub Pages
   ↓
Shopee Affiliate links từ data/affiliate.json
```

Không có API key trong JavaScript frontend. `YOUTUBE_API_KEY` chỉ được đọc trong GitHub Actions Secret.

## GitHub Pages

Workflow `.github/workflows/deploy-pages.yml` tự deploy khi source trên branch `main` thay đổi và hỗ trợ chạy thủ công.

Workflow `.github/workflows/sync-youtube.yml` chạy mỗi 6 giờ, chạy thủ công, và từ v0.10.1 còn tự chạy khi các file cấu hình/sync liên quan thay đổi trên `main`. Workflow tự xử lý toàn bộ chuỗi **Sync YouTube → commit JSON nếu có thay đổi → build Pages → deploy Pages** trong cùng một workflow.

Nếu `YOUTUBE_API_KEY` chưa được cấu hình, workflow Sync YouTube sẽ ghi rõ trạng thái skip và kết thúc sạch thay vì fail định kỳ.

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

Từ v0.10.2, trường hợp channel đã tồn tại nhưng YouTube trả `playlistNotFound` cho uploads playlist được coi là **0 video** thay vì làm fail toàn bộ workflow. Metadata channel vẫn được đồng bộ và website tiếp tục Demo Mode cho tới khi có video public.

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
- Affiliate URL được validate HTTP(S) trước khi render.
- Banner/product affiliate có thể target theo category.
- Disclosure chỉ xuất hiện khi affiliate thật sự đang hoạt động.
- Có event `affiliateclick` và hook `dataLayer` tùy chọn cho analytics sau này.
- Không popup quảng cáo, không sticky Shopee che nội dung.
- Back-to-top, empty state, loading state.
- YouTube sync bằng handle, không cần hard-code Channel ID.
- Playlist tự map thành category; playlist lạ tự tạo category mới.
- GitHub Actions sync mỗi 6 giờ + chạy thủ công + tự validation khi cấu hình sync thay đổi.
- GitHub Pages auto deploy từ `main`.
- YouTube sync chỉ ghi JSON khi dữ liệu thực sự thay đổi; thay đổi riêng timestamp không còn tạo commit rác.
- Khi dữ liệu YouTube thay đổi, Pages được build/deploy ngay trong workflow Sync YouTube.
- Playlist bị xóa/chưa khả dụng không còn làm chết toàn bộ sync; `playlistNotFound` được bỏ qua an toàn.

## Branding v0.9.0

Branding chính thức của **30s KHÁM PHÁ** đã được đưa vào UI mà không redesign toàn bộ website.

- Brand mark nguồn: `watermark (1).png` trong Google Drive Branding.
- Web asset: `assets/brand/brand-mark.svg` — SVG wrapper chứa nguyên PNG nền trong suốt để dùng ổn định trên GitHub Pages.
- Header: brand mark thật + chữ Unicode `KHÁM PHÁ` bằng Be Vietnam Pro ExtraBold.
- Footer: dùng cùng nhận diện với header.
- Favicon + Web App Manifest dùng cùng brand mark.
- Demo Mode: thumbnail mẫu có watermark brand mark nhẹ ở góc phải dưới.
- UI spacing logo được tinh chỉnh riêng cho desktop/mobile trong `assets/css/brand-v0.9.0.css`.

Palette chính thức:
- Paper Cream `#F4E8D3`
- Brick Red `#A94335`
- Charcoal Black `#252525`
- Mustard Yellow `#D6A33A`
- Muted Teal `#478784`

Typography:
- Be Vietnam Pro ExtraBold: heading / branding.
- Be Vietnam Pro Medium / SemiBold: UI / body.

Tagline chính thức: **HIỂU NHANH TRONG 30 GIÂY**.

## YouTube live integration — v0.10.2

`scripts/sync-youtube.mjs` và workflow Sync YouTube hiện xử lý:

- Resolve Channel ID từ `@30sKhamPhaCuocSong` bằng `channels.list(forHandle=...)`.
- Lấy uploads playlist, metadata video, statistics và danh sách playlist.
- Map Playlist → Category theo `data/categories.json`.
- Tự tạo category cho playlist mới chưa có mapping.
- Chỉ giữ video public.
- Tự tắt Demo Mode khi `data/videos.json` có video thật.
- So sánh dữ liệu cũ/mới và không ghi lại file chỉ vì `syncedAt` thay đổi.
- Chỉ commit `data/` khi có thay đổi thực sự.
- Sau commit dữ liệu mới, build và deploy GitHub Pages ngay trong cùng workflow.
- Tự chạy validation khi workflow/script/config/category mapping thay đổi trên `main`.
- Nhận diện lỗi YouTube API `404 / playlistNotFound` khi đọc playlist và coi playlist đó là rỗng.
- Nếu uploads playlist chưa khả dụng, tiếp tục đồng bộ metadata channel với 0 video thay vì fail.
- Nếu một playlist category bị xóa/không còn khả dụng, bỏ qua riêng playlist đó và tiếp tục các playlist khác.

### Trạng thái API key

Người quản trị đã xác nhận tạo repository secret tên `YOUTUBE_API_KEY` trong GitHub Actions vào ngày 2026-08-08. Giá trị key không được lưu trong source hoặc nhật ký.

### Kết quả sync thật

v0.10.2 đã sync thành công metadata channel vào `data/channel.json` và commit dữ liệu `81d8db3032c71b0cb12ba84dc786fc556ed37f85`. Channel hiện chưa có video public nên `data/videos.json` có `videos: []`; website tiếp tục Demo Mode đúng thiết kế.

## Shopee Affiliate — v0.11.0

Affiliate được quản lý tại `data/affiliate.json`. Mặc định `enabled: false`, vì vậy website không hiển thị banner/product cho đến khi có link thật.

### Quy tắc bật affiliate

- Đặt `enabled: true` ở cấp global.
- Banner cần `banner.enabled: true` và `banner.url` hợp lệ.
- Product cần `enabled !== false` và `url` hợp lệ.
- Chỉ URL `http://` hoặc `https://` mới được render.
- `categories: []` = hiển thị với mọi category.
- Ví dụ `categories: ["cong-nghe-do-hay"]` = chỉ hiển thị khi người dùng đang lọc category đó.
- `settings.maxProducts` giới hạn số sản phẩm render, mặc định 8.
- `priceLabel` được ưu tiên; vẫn hỗ trợ field cũ `price`.
- Có thể dùng `badge`, `cta`, `image`, `campaignId`, `id` để quản lý campaign rõ ràng.

Ví dụ một product:

```json
{
  "id": "product-example-01",
  "enabled": true,
  "title": "Tên sản phẩm",
  "priceLabel": "199.000₫",
  "badge": "Đáng chú ý",
  "cta": "Xem sản phẩm",
  "image": "https://...",
  "url": "https://...affiliate-link...",
  "categories": ["cong-nghe-do-hay"]
}
```

Affiliate link luôn mở tab mới và dùng `rel="sponsored nofollow noopener"`. Disclosure ở footer chỉ hiện khi thực tế có affiliate đang hoạt động. Website không cài tracker bên thứ ba mặc định; nếu sau này có `window.dataLayer`, click affiliate sẽ phát event `affiliate_click`.

## Quản lý dự án

- **Source-of-truth:** GitHub repository này, branch `main`.
- **Tài nguyên / tài liệu / nhật ký / backup:** Google Drive folder `1T4jul5aiUZ4m-9yBExrVx_IkU79uZd0q`.
- **Branding chính thức:** Google Drive folder `1LOiNodV2htHHuRsn7r4shd3FUYbMMZlB`.
- Mỗi lần chỉnh sửa dự án/source phải tăng version.

## Bước tiếp theo

Cung cấp banner/link/product Shopee Affiliate thật. Sau đó cấu hình `data/affiliate.json`, bật `enabled`, kiểm tra category targeting, CTA, disclosure và click behavior trên live site. Không cần thay đổi kiến trúc website để đưa campaign mới lên.
