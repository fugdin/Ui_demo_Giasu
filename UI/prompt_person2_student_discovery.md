# Prompt — Người 2: Student App (Luồng Discovery)

---

## Tech Stack

- React 19 + Vite + TypeScript
- Ant Design 5
- React Router v7
- Zustand (client state) + TanStack Query v5 (server state)
- Axios + JWT (access token in memory, refresh token in httpOnly cookie)
- `@ant-design/charts` (biểu đồ)
- Ngôn ngữ UI: **Tiếng Việt**

---

## Phạm vi màn hình

Người 2 phụ trách toàn bộ luồng từ khi người dùng mở app đến khi đăng ký xong khóa học:

```
Đăng ký → Xác minh email → Đăng nhập
  → Dashboard
  → Đánh giá năng lực (chọn ngành → làm bài → xem kết quả)
  → Khóa học (danh sách → chi tiết → đăng ký)
  → Khóa học của tôi
```

---

## Giả định về packages (do Người 1 cung cấp)

```typescript
// packages/types — dùng trực tiếp
User, Course, Assessment, Enrollment, Field

// packages/auth — dùng trực tiếp
useAuthStore()         // { user, isAuthenticated, login(), logout() }
<ProtectedRoute role="student" />

// packages/api — dùng trực tiếp
useLogin()
useRegister()
useCourses(filters?)
useCourseDetail(id)
useEnrollments()
useEnroll(courseId)
useAssessmentStart()
useAssessmentSubmit()
useFields()

// packages/ui — dùng trực tiếp
AppLayout, PageHeader, DataTable, ConfirmModal, StatusBadge, EmptyState
```

---

## Layout chung Student App

- Header: Logo + nav links (Trang chủ / Khóa học / Tiến độ / Chứng nhận) + avatar + dropdown đăng xuất
- Không có sidebar (khác Admin)
- Content: full width với max-width container
- Responsive ưu tiên desktop ≥ 1280px

---

## S-01. Đăng nhập — `/login`

**Layout:**
```
┌─────────────────────────────────────────────┐
│          🎓  AI Learning Platform           │
│  ┌─────────────────────────────────────┐   │
│  │         ĐĂNG NHẬP HỌC VIÊN          │   │
│  │  Email      [___________________]   │   │
│  │  Mật khẩu   [___________________] 👁│   │
│  │  [x] Ghi nhớ đăng nhập              │   │
│  │              Quên mật khẩu?         │   │
│  │      [    ĐĂNG NHẬP    ]            │   │
│  │  Chưa có tài khoản? Đăng ký ngay   │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Components:**
- `Input` email + `Input.Password` với toggle 👁
- `Checkbox` ghi nhớ đăng nhập
- `Button` primary submit
- `Alert` error khi sai credentials

**Logic:**
- Submit → `POST /auth/login`
- Thành công → lưu token → redirect `/`
- Đã có token hợp lệ → redirect `/` luôn
- Sai role → redirect về app đúng (teacher/admin app)

---

## S-02. Đăng ký — `/register`

**Layout:**
```
┌─────────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐   │
│  │         ĐĂNG KÝ TÀI KHOẢN           │   │
│  │  Họ và tên  [___________________]   │   │
│  │  Email      [___________________]   │   │
│  │  Mật khẩu   [___________________]   │   │
│  │  Xác nhận   [___________________]   │   │
│  │  [x] Tôi đồng ý Điều khoản DV      │   │
│  │      [    TẠO TÀI KHOẢN    ]        │   │
│  │  Đã có tài khoản? Đăng nhập         │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Validation:**
- Họ tên: bắt buộc, min 2 ký tự
- Email: bắt buộc, đúng format, kiểm tra trùng realtime
- Mật khẩu: min 8 ký tự, hiện strength indicator
- Xác nhận: phải khớp mật khẩu
- Checkbox điều khoản: bắt buộc tick

**Logic:**
- Submit → `POST /auth/register` → redirect `/verify-email?email=xxx`

---

## S-03. Xác minh email — `/verify-email`

**Layout:**
```
┌─────────────────────────────────────────────┐
│                    ✉️                       │
│      Kiểm tra email của bạn!                │
│  Đã gửi link đến: user@example.com          │
│                                             │
│      [ Gửi lại email ]  (đếm ngược 60s)    │
│      Về trang đăng nhập                    │
└─────────────────────────────────────────────┘
```

**Logic:**
- Email lấy từ query param `?email=`
- Nút Gửi lại: disabled + đếm ngược 60s sau khi click → `POST /auth/resend-verification`
- Khi user click link trong email → `GET /auth/verify?token=` → redirect `/login`

---

## S-04. Dashboard — `/`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Header                                                 │
├─────────────────────────────────────────────────────────┤
│  Xin chào, [Tên]! 👋                                    │
│                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │ KH đang học │ │  Bài hoàn   │ │  Chứng nhận │      │
│  │     3       │ │    12/20    │ │      1      │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
│                                                         │
│  ┌───────────────────────┐  ┌────────────────────┐    │
│  │ 📚 Tiếp tục học       │  │ 🧠 Đánh giá NL     │    │
│  │ Python Cơ bản         │  │ Kiểm tra trình độ  │    │
│  │ Bài 5: Vòng lặp       │  │ để nhận gợi ý KH   │    │
│  │ ████████░░░░ 60%       │  │  [Bắt đầu ngay]    │    │
│  │ [Tiếp tục]            │  └────────────────────┘    │
│  └───────────────────────┘                             │
│                                                         │
│  🏫 Tham gia lớp học                                   │
│  [ Nhập mã lớp... ]  [Tham gia]                        │
└─────────────────────────────────────────────────────────┘
```

**Components:**
- 3 `Statistic` cards (KH đang học, Bài hoàn thành, Chứng nhận)
- Card "Tiếp tục học": lấy enrollment gần nhất chưa xong, hiện progress bar
- Card "Đánh giá NL": chỉ hiện nếu chưa từng làm assessment
- Input mã lớp + nút Tham gia → `POST /classes/join {code}`

**States:**
- Loading: Skeleton cho từng card
- Lần đầu đăng nhập (chưa có enrollment): ẩn card Tiếp tục học, hiện banner mời làm assessment

---

## S-05. Chọn ngành/môn đánh giá — `/assessment`

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│   🧠  ĐÁNH GIÁ NĂNG LỰC                            │
│                                                     │
│   Ngành học *   [─── Chọn ngành ──────── ▼]        │
│   Môn học *     [─── Chọn môn ─────────── ▼]       │
│                                                     │
│   Trình độ hiện tại *                              │
│   ( ) Chưa biết gì                                 │
│   (•) Biết sơ sơ                                   │
│   ( ) Thành thạo                                   │
│                                                     │
│   ⏱ ~20 phút  |  📝 15-20 câu                      │
│                                                     │
│          [    BẮT ĐẦU    ]                         │
└─────────────────────────────────────────────────────┘
```

**Logic:**
- Dropdown Ngành: fetch `GET /fields?hasAssessment=true`
- Dropdown Môn: disabled cho đến khi chọn ngành, fetch theo fieldId
- Nút BẮT ĐẦU disabled nếu chưa chọn đủ 3 field
- Submit → `POST /assessment/start` → nhận `sessionId` → redirect `/assessment/take`

---

## S-06. Làm bài đánh giá — `/assessment/take`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Python Cơ bản                              ⏱ 18:42    │
├─────────────────────────────────────────────────────────┤
│  Câu 3 / 15              ████████░░░░░  3/15           │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  print(2 ** 3) bằng bao nhiêu?                 │  │
│  │                                                  │  │
│  │  (•) A. 6    ( ) B. 8    ( ) C. 9    ( ) D. 23  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  [◀ Câu trước]    [▶ Câu tiếp]    [Nộp bài]          │
│  ●●●○○○○○○○○○○○○  (dot grid trạng thái từng câu)      │
└─────────────────────────────────────────────────────────┘
```

**Components:**
- Countdown timer: đếm ngược, chuyển đỏ + pulse khi < 2 phút
- Progress bar số câu đã trả lời
- Render câu hỏi theo type: `single_choice` (Radio), `multiple_choice` (Checkbox), `fill_in_blank` (Input), audio player cho câu nghe
- Dot grid: xanh = đã trả lời, xám = chưa
- Nút Nộp bài: confirm modal trước khi submit

**Logic:**
- Hết giờ → auto submit
- Submit → `POST /assessment/submit {sessionId, answers}` → redirect `/assessment/result/:id`
- Không có session → redirect `/assessment`

---

## S-07. Kết quả đánh giá — `/assessment/result/:id`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│              🏆  KẾT QUẢ ĐÁNH GIÁ                      │
│                                                         │
│              78 / 100                                   │
│         Trình độ: [TRUNG CẤP]                           │
│                                                         │
│  📚 Khóa học đề xuất cho bạn                            │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ Python Trung cấp│  │ OOP với Python  │              │
│  │ 20 bài          │  │ 15 bài          │              │
│  │ [Đăng ký]       │  │ [Đăng ký]       │              │
│  └─────────────────┘  └─────────────────┘              │
│                                                         │
│   [Xem tất cả khóa học]   [Về trang chủ]              │
└─────────────────────────────────────────────────────────┘
```

**Components:**
- `Statistic` điểm số với animation count-up
- `Tag` level: màu đỏ (Chưa biết) / vàng (Cơ bản) / xanh dương (Trung cấp) / xanh lá (Thành thạo)
- Grid card khóa học đề xuất (fetch từ result)
- Nút Đăng ký → `POST /enrollments/:courseId`

---

## S-08. Danh sách khóa học — `/courses`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  [ 🔍 Tìm khóa học... ]  [Ngành ▼]  [Level ▼]         │
│  Hiển thị 12 / 48 khóa học                             │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ [Ảnh]   │  │ [Ảnh]   │  │ [Ảnh]   │            │
│  │ Python  │  │ JS NC   │  │ AI/ML   │            │
│  │ Cơ bản  │  │         │  │         │            │
│  │ 20 bài  │  │ 15 bài  │  │ 25 bài  │            │
│  │ [Cơ bản]│  │ [Nâng cao│  │[Trung cấp│            │
│  │[Xem thêm]│  │[Đăng ký] │  │[Đăng ký] │            │
│  └──────────┘  └──────────┘  └──────────┘            │
│               [  1  2  3  4  >  ]                      │
└─────────────────────────────────────────────────────────┘
```

**Components:**
- `Input.Search` debounce 300ms
- `Select` filter ngành (multi-select) + level
- Grid 3-4 cột card khóa học
- Card: ảnh cover, tên, số bài, level badge, nút Xem thêm / Đăng ký / Tiếp tục học
- `Pagination` 12 items/trang

**States:**
- Card đã đăng ký: nút đổi thành "Tiếp tục học" màu xanh
- Loading: skeleton grid 12 cards

---

## S-09. Chi tiết khóa học — `/courses/:id`

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│  ┌───────────────────────┐  ┌─────────────────────────┐  │
│  │  [Ảnh cover lớn]     │  │ Python Cơ bản           │  │
│  │                      │  │ Level: Cơ bản            │  │
│  │                      │  │ 20 bài học               │  │
│  │                      │  │ Ngành: CNTT              │  │
│  └───────────────────────┘  │ Điểm pass: ≥ 70%        │  │
│                              │                         │  │
│                              │ [    ĐĂNG KÝ    ]       │  │
│                              └─────────────────────────┘  │
│  📋 Mô tả                                                  │
│  [render HTML từ rich text]                               │
│                                                            │
│  📚 Nội dung khóa học (20 bài)                            │
│  ▼ Bài 1: Giới thiệu Python       ~15 phút               │
│  ▼ Bài 2: Biến & Kiểu dữ liệu    ~20 phút               │
└────────────────────────────────────────────────────────────┘
```

**Components:**
- Layout 2 cột: ảnh cover (trái) + card thông tin sticky (phải)
- `dangerouslySetInnerHTML` render HTML mô tả
- `Collapse` danh sách bài học
- Nút ĐĂNG KÝ → `POST /enrollments/:courseId` → đổi thành "VÀO HỌC"

---

## S-10. Khóa học của tôi — `/my-courses`

**Layout:**
```
┌────────────────────────────────────────────────────┐
│  [Đang học (3)]        [Đã hoàn thành (1)]         │
│  ───────────────────────────────────               │
│  ┌──────────────────────────────────────────────┐ │
│  │ [Ảnh]  Python Cơ bản            Đang học    │ │
│  │        Bài 5/20 · Vòng lặp                   │ │
│  │        ████████████░░░░░░░░  60%             │ │
│  │                       [Tiếp tục học]          │ │
│  └──────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────┐ │
│  │ [Ảnh]  JavaScript Nâng cao       Đang học   │ │
│  │        Bài 2/15                               │ │
│  │        ████░░░░░░░░░░░░░░░░  13%             │ │
│  │                       [Tiếp tục học]          │ │
│  └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

**Components:**
- `Tabs`: "Đang học" / "Đã hoàn thành" với count badge
- List card: ảnh, tên KH, tên lesson đang học, progress bar %, nút Tiếp tục
- Empty state: "Bạn chưa đăng ký khóa học nào" + nút "Khám phá khóa học"
- Tab "Đã hoàn thành": hiện thêm nút "Xem chứng nhận"

**Logic:**
- "Tiếp tục học" → `GET /enrollments/:id/continue` để lấy lessonId cuối cùng → redirect `/learn/:courseId/:lessonId`

---

## Quy tắc chung cho Student App (Luồng Discovery)

- Mọi API call phải có **loading state** (Skeleton cho list/grid, Spinner cho button)
- Mọi danh sách trống phải có **Empty state**
- Lỗi 401 → clear token → redirect `/login`
- Toast dùng `message.success/error/warning`, duration 3s
- Tất cả text, label, error bằng **tiếng Việt**
- Auth pages (`/login`, `/register`, `/verify-email`): dùng `AuthLayout` (centered card, không có header nav)
- Các trang còn lại: dùng `MainLayout` với header nav đầy đủ
- Route guard: `<ProtectedRoute role="student" />` bọc tất cả trang trừ auth
