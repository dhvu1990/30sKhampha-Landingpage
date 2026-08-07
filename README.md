# 30s Khám phá - Landing Page

Website trung tâm nội dung cho dự án **30s Khám phá**.

## Phiên bản hiện tại
**v0.4.0** — Homepage Mockup & Design Tokens

## Mục tiêu
- Hiển thị video từ kênh YouTube 30s Khám phá.
- Phân loại video rõ ràng theo chủ đề / playlist.
- Tối ưu trải nghiệm mobile và tốc độ tải trang.
- Tích hợp Shopee Affiliate một cách hợp lý, không làm ảnh hưởng trải nghiệm nội dung.
- Theo dõi hiệu quả video và affiliate bằng analytics.

## Kiến trúc đã thống nhất
- CMS: WordPress.
- Theme: custom lightweight, mobile-first.
- Nguồn video: YouTube Data API.
- Phân loại: YouTube Playlist -> Website Category, cấu hình trong WordPress Admin.
- Mỗi video có Primary Category để URL/breadcrumb nhất quán.
- Trang danh sách dùng thumbnail 16:9; không load hàng loạt iframe YouTube.
- Player chỉ tải tại trang chi tiết video.
- Featured Video ưu tiên chọn thủ công trong Admin, fallback video mới nhất.
- Affiliate: banner chiến dịch, contextual CTA và product card.
- Tracking: GA4.

## Sitemap hiện tại
- `/`
- `/video/`
- `/video/{slug-video}`
- `/category/{slug-danh-muc}`
- `/search/`
- `/gioi-thieu/`
- `/lien-he/`
- `/affiliate-disclosure/`

## Danh mục đề xuất
1. Công nghệ & Đồ hay
2. Khoa học & Bí ẩn
3. Thế giới quanh ta
4. Động vật & Thiên nhiên
5. Mẹo hay 30s
6. Sản phẩm thú vị
7. Câu đố & Thử thách
8. Top & Sự thật nhanh

Chỉ public category khi có đủ nội dung; khuyến nghị tối thiểu 4 video/category.

## Homepage v0.4.0
Desktop flow:
1. Header
2. Hero / Featured Video
3. Category Chips
4. Video mới nhất
5. Affiliate Slot A — banner ngang responsive
6. Category Sections
7. Affiliate Slot B — native product cards
8. Video phổ biến / đề xuất
9. Footer

Mobile:
- Header gọn với search + hamburger.
- Hero full-width.
- Category chips cuộn ngang.
- Video grid ưu tiên 2 cột khi đủ rộng, fallback 1 cột.
- Affiliate product cards cuộn ngang.
- Không popup/sticky affiliate che nội dung.

## Visual Direction
**Modern Discovery / Editorial Cards**
- Giao diện sáng, sạch, nhiều khoảng trắng.
- Thumbnail là yếu tố thị giác chính.
- Card bo góc vừa phải, hiệu ứng nhẹ.
- Shopee orange chỉ dùng cho affiliate CTA/banner, không làm màu thương hiệu chính.

## Design Tokens sơ bộ
- Spacing: `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px`.
- Card radius: `12-16px`.
- Desktop container: khoảng `1200-1280px`.
- Mobile padding: khoảng `16px`.
- Typography: tối đa 2 font family, ưu tiên nhẹ và dễ đọc.

## Performance & UX rules
- Không load iframe YouTube tại listing.
- Lazy-load thumbnail ngoài vùng nhìn đầu tiên.
- JS tối thiểu; không dùng page builder nặng.
- Không popup/interstitial affiliate.
- Không fake CTA/play button để dẫn sang Shopee.
- Tỷ lệ định hướng: khoảng 80% content / 20% commerce.

## Quản lý dự án
- Source code: repository này, branch `main`.
- Tài nguyên và nhật ký triển khai: Google Drive folder `1T4jul5aiUZ4m-9yBExrVx_IkU79uZd0q`.
- Quy tắc version: mỗi lần chỉnh sửa source/dự án phải tăng version.

## Trạng thái
**Planning / Visual Mockup — v0.4.0**

Đã tạo visual mockup Homepage Desktop + Mobile. Bước tiếp theo: duyệt mockup, khóa branding/design tokens ở v0.5.0, sau đó scaffold source WordPress/theme/plugin.
