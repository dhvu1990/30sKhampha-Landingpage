# 30s Khám phá - Landing Page

Website trung tâm nội dung cho dự án **30s Khám phá**.

## Phiên bản hiện tại
**v0.3.0** — Category & Visual Direction

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

## Danh mục đề xuất v0.3.0
1. Công nghệ & Đồ hay
2. Khoa học & Bí ẩn
3. Thế giới quanh ta
4. Động vật & Thiên nhiên
5. Mẹo hay 30s
6. Sản phẩm thú vị
7. Câu đố & Thử thách
8. Top & Sự thật nhanh

Chỉ public category khi có đủ nội dung; khuyến nghị tối thiểu 4 video/category.

## Visual Direction
**Modern Discovery / Editorial Cards**
- Giao diện sáng, sạch, nhiều khoảng trắng.
- Thumbnail là yếu tố thị giác chính.
- Card bo góc vừa phải, hiệu ứng nhẹ.
- Shopee orange chỉ dùng cho affiliate CTA/banner, không làm màu thương hiệu chính.

## Quản lý dự án
- Source code: repository này, branch `main`.
- Tài nguyên và nhật ký triển khai: Google Drive folder `1T4jul5aiUZ4m-9yBExrVx_IkU79uZd0q`.
- Quy tắc version: mỗi lần chỉnh sửa source/dự án phải tăng version.

## Trạng thái
**Planning / UX Architecture — v0.3.0**

Bước tiếp theo: dựng mockup Homepage Desktop + Mobile, sau đó chốt Design Tokens trước khi bắt đầu source production.
