# 30s Khám phá - Landing Page

Website trung tâm nội dung cho dự án **30s Khám phá**.

## Phiên bản hiện tại
**v0.5.0** — Brand Migration

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

## Brand Migration v0.5.0
Nguồn nhận diện chuẩn được kế thừa từ branch **30s Công Nghệ** trên Google Drive.

Nguyên tắc:
- Giữ nguyên icon `30s`, silhouette, tỷ lệ và cấu trúc layered paper-cut.
- Giữ nguyên vị trí chữ `s`, circuit line và circuit nodes.
- Giữ nguyên palette, typography và hiệu ứng bóng giấy.
- Giữ nguyên cách tổ chức logo horizontal / stacked / icon-only.
- Không redesign thành logo mới.
- Thay đổi duy nhất ở wordmark: **Công Nghệ -> Khám Phá**.
- Tagline giữ nguyên: **Hiểu nhanh trong 30 giây**.

### Palette chính thức
- Paper Cream: `#F4E8D3`
- Brick Red: `#A94335`
- Charcoal Black: `#252525`
- Mustard Yellow: `#D6A33A`
- Muted Teal: `#478784`

### Typography chính thức
- Primary / wordmark / heading: **Be Vietnam Pro ExtraBold**.
- Secondary: **Be Vietnam Pro Medium / SemiBold**.

### Asset source đã sao lưu
Trong Google Drive project: `01_Tai-nguyen/Branding`
- `SOURCE_30s_Cong_Nghe_logo_horizontal_v1.0.1.png`
- `SOURCE_30s_Cong_Nghe_logo_icon_only_v1.0.1.png`
- `SOURCE_Đặc tả nhận diện 30s Công Nghệ v1.0.0`
- `30s Khám Phá - Brand Migration Spec v0.5.0`

Quy tắc production: không sử dụng AI redraw nếu làm thay đổi icon, font, màu hoặc layout. Asset logo mới phải giữ fidelity với source gốc.

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

## Homepage
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

## Website Design Tokens
Website sẽ chuyển từ palette mockup tạm sang đúng palette brand gốc ở v0.5.0.
- Spacing: `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px`.
- Card radius: `12-16px`.
- Desktop container: `1200-1280px`.
- Mobile padding: khoảng `16px`.
- Brand heading: Be Vietnam Pro ExtraBold.
- Body/UI: Be Vietnam Pro Medium/SemiBold hoặc system fallback tối ưu hiệu năng.

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
- Brand source tham chiếu: Google Drive folder `19FGsfgmmajtaRi5nV5w_6FspKMVdxTL_`.
- Quy tắc version: mỗi lần chỉnh sửa source/dự án phải tăng version.

## Trạng thái
**Planning / Brand Migration — v0.5.0**

Brand direction đã khóa. Bước tiếp theo: dựng asset logo `30s Khám Phá` production với fidelity đúng source, áp design tokens chính xác vào website và bắt đầu scaffold WordPress/theme/plugin ở version kế tiếp.
