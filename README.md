# 30s Khám Phá — Landing Page

Phiên bản: **v0.7.0**

Website static một trang, không WordPress/CMS. Video tự đồng bộ từ YouTube.

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
```

Không có API key trong JavaScript frontend. `YOUTUBE_API_KEY` chỉ nằm trong GitHub Actions Secret.

## Chế độ khi kênh chưa có video

`config/site.json` đặt `demoWhenEmpty: true`.

Khi `data/videos.json` chưa có video, website hiển thị dữ liệu mẫu có nhãn **MẪU GIAO DIỆN** để kiểm tra đầy đủ UX. Ngay sau lần sync có video thật, dữ liệu mẫu tự biến mất.

## Tính năng v0.7.0

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
- Affiliate link tự dùng `rel="sponsored nofollow noopener"`.
- Không popup quảng cáo, không sticky Shopee che nội dung.
- Back-to-top, empty state, loading state.
- YouTube sync bằng handle, không cần hard-code Channel ID.
- Playlist tự map thành category; playlist lạ tự tạo category mới.
- GitHub Actions chạy mỗi 6 giờ + chạy thủ công.

## Bật đồng bộ YouTube

1. Tạo YouTube Data API v3 key trong Google Cloud.
2. Vào GitHub repository → Settings → Secrets and variables → Actions.
3. Tạo secret: `YOUTUBE_API_KEY`.
4. Chạy workflow `Sync YouTube` thủ công lần đầu.

Script dùng `channels.list(forHandle=...)` để tự resolve Channel ID từ handle.

## Affiliate

Sửa duy nhất `data/affiliate.json` khi có campaign/link Shopee. Nếu `enabled=false` hoặc không có URL, khu vực quảng cáo tự ẩn hoàn toàn.

## Branding

Wordmark web dùng Unicode HTML `30s KHÁM PHÁ` để đảm bảo dấu tiếng Việt luôn đúng. Asset logo gốc/production được quản lý tại Google Drive dự án và sẽ được đưa vào repo ở dạng web-optimized khi chốt file binary.

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
