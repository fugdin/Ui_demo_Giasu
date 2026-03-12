# Prompt — Người 3: Student App (Luồng Learning) + Teacher App

---

## Tech Stack

- React 19 + Vite + TypeScript
- Ant Design 5
- React Router v7
- Zustand (client state) + TanStack Query v5 (server state)
- Axios + JWT (access token in memory, refresh token in httpOnly cookie)
- `@dnd-kit/core` (drag and drop trong bài tập)
- `react-pdf` (xem PDF)
- Ngôn ngữ UI: **Tiếng Việt**

---

## Phạm vi màn hình

**Student Learning (S-11 đến S-16):**
```
Vào học lesson → Làm bài tập → Xem kết quả
→ Theo dõi tiến độ
→ Xem chứng nhận
→ Tham gia lớp học
```

**Teacher App (T-01 đến T-07):**
```
Dashboard → Quản lý lớp → Theo dõi HS → Quản lý slide
```

---

## Giả định về packages (do Người 1 cung cấp)

```typescript
// packages/types
User, Course, Lesson, Question, Attempt, Certificate, Class, Enrollment

QuestionType = 'single_choice' | 'multiple_choice' | 'fill_in_blank'
             | 'drag_and_drop' | 'true_false' | 'sort_paragraphs'

// packages/auth
useAuthStore()
<ProtectedRoute role="student" />
<ProtectedRoute role="teacher" />

// packages/api — Student
useLesson(lessonId)
usePractice(lessonId)
useSubmitPractice()
useAttemptResult(attemptId)
useProgress()
useCertificates()

// packages/api — Teacher
useClasses()
useCreateClass()
useClassDetail(id)
useStudentProgress(classId, studentId)
useUploadSlide()

// packages/ui
AppLayout, PageHeader, DataTable, ConfirmModal, StatusBadge, EmptyState
```

---

# PHẦN 1 — STUDENT APP (Luồng Learning)

## Layout trang học lesson

```
┌────────────────────────────────────────────────────────────────┐
│  Header (Logo, Tên khóa học, Avatar)                          │
├────────────┬───────────────────────────────────────────────────┤
│  Sidebar   │  Content area                                     │
│  (240px)   │                                                   │
│            │                                                   │
│  ✓ Bài 1  │                                                   │
│  ✓ Bài 2  │                                                   │
│  ►Bài 3   │                                                   │
│   Bài 4   │                                                   │
│  ──────── │                                                   │
│  < 1 2 3 >│                                                   │
│            │                                                   │
│  ██░ 60%  │                                                   │
└────────────┴───────────────────────────────────────────────────┘
```

**Sidebar:**
- Danh sách lesson, icon ✓ xanh cho bài đã completed
- Bài đang học được highlight
- Phân trang nếu nhiều bài (mini pagination)
- Progress bar % hoàn thành course ở dưới cùng

---

## S-11. Trang học lesson — `/learn/:courseId/:lessonId`

**Layout:**
```
┌────────────────────────────────────────────────────────────────┐
│  Header                                                        │
├────────────┬───────────────────────────────────────────────────┤
│  Sidebar   │  Breadcrumb: Python CB > Bài 5: Vòng lặp         │
│            │                                                   │
│            │  [Lý thuyết]  [Tương tác]  [Bài tập]            │
│  ✓ Bài 1  │  ─────────────────────────────────────────        │
│  ✓ Bài 2  │  ┌──────────────────────────────────────────┐   │
│  ✓ Bài 3  │  │                                          │   │
│  ✓ Bài 4  │  │  [Nội dung theo tab]                     │   │
│  ►Bài 5   │  │                                          │   │
│   Bài 6   │  └──────────────────────────────────────────┘   │
│  ──────── │                                                   │
│  < 1 2 3 >│  [◀ Bài trước]              [Bài tiếp ▶]        │
│  ██░ 60%  │                                        💬 Chat  │
└────────────┴───────────────────────────────────────────────────┘
```

**Tab Lý thuyết:**
- Render HTML content (`dangerouslySetInnerHTML`)
- `Collapse` section Slide (optional):
  - Header: "📎 Slide bài giảng" + toggle mở/đóng
  - Nội dung: `<iframe>` embed link slide
  - Chỉ hiển thị nếu lesson có slide và teacher bật ON

**Tab Tương tác:**
- Nếu `contentType = 'video'`: render `<iframe>` YouTube embed
- Nếu `contentType = 'simulation'`: render `<iframe>` HTML sandbox với content từ server

**Tab Bài tập:**
- Hiện tóm tắt: số câu, điểm cao nhất (nếu đã làm)
- Nút [Bắt đầu làm bài] → redirect `/practice/:lessonId`
- Nếu đã pass (≥70%): hiện badge "✅ Đã đạt" + điểm cao nhất + nút "Làm lại"
- Nếu chưa pass: hiện badge "❌ Chưa đạt" + điểm + nút "Làm lại"

**AI Chat Widget:**
- Floating button 💬 góc phải dưới
- Click → mở `Drawer` từ phải, width 360px
- Header drawer: "🤖 Trợ lý AI"
- Input chat ở dưới, message list ở trên (scroll)
- Gọi `POST /ai/chat` với body: `{ courseId, lessonId, message, attemptId? }`
- Streaming response nếu API hỗ trợ, fallback loading spinner

---

## S-12. Làm bài tập — `/practice/:lessonId`

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│  Bài tập: Vòng lặp trong Python         ⏱ 12:34      │
├────────────────────────────────────────────────────────┤
│  Câu 2 / 10       ████████░░░░░░  20%                 │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  [Nội dung câu hỏi theo type]                   │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  [◀ Câu trước]  [▶ Câu tiếp]  [Nộp bài]  💬        │
└────────────────────────────────────────────────────────┘
```

**6 loại câu hỏi — component riêng cho mỗi loại:**

**`SingleChoiceQuestion`:**
```
( ) A. Đáp án 1
(•) B. Đáp án 2   ← đã chọn
( ) C. Đáp án 3
( ) D. Đáp án 4
```
Dùng `Radio.Group`

**`MultipleChoiceQuestion`:**
```
[x] A. Đáp án 1   ← đã chọn
[ ] B. Đáp án 2
[x] C. Đáp án 3   ← đã chọn
[ ] D. Đáp án 4
```
Dùng `Checkbox.Group`

**`FillInBlankQuestion`:**
```
Điền vào chỗ trống:
Python là ngôn ngữ _____ cấp cao.
[ lập trình          ]
```
Dùng `Input`

**`TrueFalseQuestion`:**
```
"Vòng lặp for trong Python bắt buộc phải có else"
( ) Đúng   (•) Sai
```
Dùng `Radio.Group` 2 options

**`DragAndDropQuestion`:**
```
Kéo thả vào đúng nhóm:

[Python] [Java] [HTML] [CSS]    ← items kéo được

┌─────────────┐  ┌─────────────┐
│ Lập trình   │  │ Thiết kế   │
│  Python ✓  │  │   HTML ✓   │
└─────────────┘  └─────────────┘
```
Dùng `@dnd-kit/core`

**`SortParagraphsQuestion`:**
```
Sắp xếp các bước theo thứ tự đúng: (kéo để di chuyển)
≡  Khai báo biến
≡  In kết quả
≡  Tính toán
```
Dùng `@dnd-kit/sortable`

**Logic chung:**
- Lưu đáp án vào local state (không auto-save lên server)
- Nút Nộp bài → confirm modal: "Bạn còn X câu chưa trả lời. Vẫn nộp?" → `POST /practice/:lessonId/submit`
- Hết lượt (3/ngày): hiện banner "Đã hết lượt hôm nay. Reset lúc 12:00 trưa" — vẫn cho xem bài cũ
- AI Chat: trong khi làm bài, note rõ trong request để server chỉ trả hint

---

## S-13. Kết quả bài tập — `/practice/:lessonId/result/:attemptId`

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│   ✅ BẠN ĐÃ ĐẠT!        hoặc      ❌ CHƯA ĐẠT        │
│                                                        │
│   Điểm: 85 / 100                                      │
│   ████████████████████░░  85%                         │
│   Điểm cao nhất: 85                                   │
│                                                        │
│   📋 Chi tiết câu hỏi                                 │
│   ✅ Câu 1 · Đúng                                     │
│   ❌ Câu 2 · Sai — Bạn chọn: A  |  Đúng: C           │
│   ✅ Câu 3 · Đúng                                     │
│                                                        │
│   🤖 Phân tích từ AI                                  │
│   ▼ Câu 2: Bạn nhầm vì... [expand để xem]            │
│                                                        │
│   [Làm lại · còn 2 lượt]    [Bài tiếp theo]          │
└────────────────────────────────────────────────────────┘
```

**Components:**
- `Result` Ant Design: type="success" nếu ≥70%, type="error" nếu <70%
- `Progress` bar điểm
- `Statistic`: điểm lần này + điểm cao nhất
- List câu hỏi: mỗi item expand ra xem chi tiết đáp án
- `Collapse` phân tích AI: fetch `GET /attempts/:attemptId/analysis`
- Nút Làm lại: disabled + tooltip nếu hết lượt (hiện giờ reset)
- Nút Bài tiếp: `GET /lessons/:lessonId/next` → redirect

---

## S-14. Tiến độ học tập — `/progress`

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│  [Tháng 3, 2026 ▼]                                      │
│                                                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐               │
│  │Bài học  │  │Bài đạt  │  │Tổng giờ │               │
│  │   18    │  │  15     │  │  24h    │               │
│  └─────────┘  └─────────┘  └─────────┘               │
│                                                          │
│  📊 Hoạt động theo ngày                                 │
│  [Bar chart — số bài học mỗi ngày trong tháng]         │
│                                                          │
│  📚 Tiến độ từng khóa học                               │
│  Python Cơ bản   ██████████████░░░░░  70%  13/20       │
│  JavaScript NC   ████░░░░░░░░░░░░░░░  20%   3/15       │
└──────────────────────────────────────────────────────────┘
```

**Components:**
- `DatePicker` picker="month" → `GET /progress?month=2026-03`
- 3 `Statistic` cards
- `@ant-design/charts` Column chart theo ngày
- List progress bar theo từng khóa học

---

## S-15. Chứng nhận — `/certificates`

**Layout:**
```
┌────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────┐ │
│  │  🏆                                          │ │
│  │  CHỨNG NHẬN HOÀN THÀNH                      │ │
│  │                                              │ │
│  │  Python Cơ bản                              │ │
│  │  Cấp cho: Nguyễn Văn Nam                    │ │
│  │  Ngày: 01/02/2026                           │ │
│  │                                              │ │
│  │  [Xem chi tiết]     [⬇ Tải PDF]             │ │
│  └──────────────────────────────────────────────┘ │
│  (mỗi khóa hoàn thành = 1 card)                   │
└────────────────────────────────────────────────────┘
```

**Components:**
- Grid cards chứng nhận
- Nút Xem chi tiết → modal với `react-pdf` preview
- Nút Tải PDF → `GET /certificates/:id/download` → browser trigger download
- Empty state: "Hoàn thành khóa học để nhận chứng nhận" + nút "Xem khóa học"

---

## S-16. Tham gia lớp học — `/join-class`

**Layout:**
```
┌────────────────────────────────────────────────────┐
│           🏫  NHẬP MÃ LỚP HỌC                    │
│                                                    │
│  Mã lớp *                                         │
│  [ ABCDEF   ]  (6 ký tự in hoa, auto uppercase)  │
│                                                    │
│         [  THAM GIA LỚP  ]                        │
│                                                    │
│  Lớp đã tham gia:                                 │
│  ● Python K1 · GV Trần Văn A · 2 khóa học        │
│  ● JS Nâng cao · GV Lê Thị B · 1 khóa học        │
└────────────────────────────────────────────────────┘
```

**Logic:**
- Input: maxLength=6, auto uppercase khi gõ
- Nút disabled nếu < 6 ký tự
- Submit → `POST /classes/join {code}`
- Thành công: toast + reload list lớp đã tham gia
- Lỗi "không tồn tại": `Alert` error
- Lỗi "đã tham gia": `Alert` warning

---

# PHẦN 2 — TEACHER APP

> Chạy tại port **3002**. Layout khác Student: có Sidebar giống Admin.

## Layout chung Teacher App

- Sidebar trái: Dashboard / Lớp học / Khóa học
- Header: Logo + "Giảng viên" label + tên + dropdown đăng xuất
- Tất cả route bọc trong `<ProtectedRoute role="teacher" />`

---

## T-01. Dashboard giáo viên — `/`

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│  Xin chào, thầy/cô Trần Văn A! 👋                      │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Tổng số lớp │  │Tổng học sinh│  │ Hoàn thành  │    │
│  │      4      │  │     120     │  │    68%      │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                          │
│  📋 Hoạt động gần đây                                   │
│  ● Nguyễn Nam hoàn thành Bài 5 — 2h trước              │
│  ● Lê Anh đạt 85% Bài 3 — 3h trước                    │
│                                                          │
│  Lớp học:                                               │
│  Python K1   | 30 HS | 72%  [Chi tiết →]               │
│  JS Nâng cao | 25 HS | 45%  [Chi tiết →]               │
└──────────────────────────────────────────────────────────┘
```

**Components:**
- 3 Statistic cards
- `Timeline` hoạt động gần đây (fetch `GET /teacher/activities`)
- Mini table lớp học → click row → redirect `/classes/:id`
- Nút nhanh [+ Tạo lớp mới]

---

## T-02. Danh sách lớp — `/classes`

**Layout:**
```
[ 🔍 Tìm lớp... ]                    [ + Tạo lớp mới ]

Tên lớp    | Số HS | Số KH | Ngày tạo  | Action
Python K1  |  30   |   2   | 01/01/26  |  👁  🗑
JS NC      |  25   |   1   | 05/01/26  |  👁  🗑
```

**Actions:**
- 👁 → redirect `/classes/:id`
- 🗑 + confirm → `DELETE /classes/:id`
- Tạo lớp mới → redirect `/classes/create`

---

## T-03. Tạo lớp mới — `/classes/create`

**Form:**
- Tên lớp* (Input, max 100 ký tự)
- Mô tả (Textarea, tùy chọn)
- Nút [Tạo lớp] → `POST /classes`

**Sau khi tạo thành công → Modal hiện:**
```
┌────────────────────────────────────────┐
│  🎉 Tạo lớp thành công!               │
│                                        │
│  Mã mời:  [ ABCD12 ]  [📋 Sao chép]  │
│  Hiệu lực: 3 ngày                     │
│                                        │
│  [Đi đến chi tiết lớp]               │
└────────────────────────────────────────┘
```

---

## T-04. Chi tiết lớp — `/classes/:id`

**Header lớp:**
```
Python K1  ·  30 học sinh  ·  Ngày tạo: 01/01/2026
Mã mời: ABCD12  [📋 Sao chép]  [🔄 Tạo mã mới]
```

**3 Tab:**

**Tab Học sinh:**
```
Tên          | Email          | Ngày tham gia | Action
Nguyễn Nam   | nam@email.com  | 02/01/2026    |  👁
Lê Anh       | anh@email.com  | 03/01/2026    |  👁
```
- 👁 → redirect `/classes/:id/students/:studentId`

**Tab Khóa học:**
- List khóa học đã gán cho lớp
- Nút [+ Gán khóa học] → Modal chọn từ danh sách courses có sẵn → `POST /classes/:id/courses`
- Nút xóa KH khỏi lớp → `DELETE /classes/:id/courses/:courseId`

**Tab Tiến độ:**
```
Tên HS      | Python CB | JS NC | % TB
Nguyễn Nam  |   70%     |  30%  | 50%
Lê Anh      |   90%     |  60%  | 75%
```
- Bảng tổng hợp tất cả HS × tất cả KH
- Click tên HS → redirect `/classes/:id/students/:studentId`

---

## T-05. Tiến độ từng học sinh — `/classes/:id/students/:studentId`

**Layout:**
```
┌───────────────────────────────────────────────────────────┐
│  👤 Nguyễn Văn Nam  ·  nam@email.com  ·  02/01/2026      │
│                                                           │
│  Python Cơ bản  ·  60%                                   │
│  ████████████████░░░░░░░░░░  12/20 bài                   │
│                                                           │
│  Bài │ Tên                │ Trạng thái  │ Điểm cao nhất  │
│  1   │ Giới thiệu         │ ✅ Đạt      │ 95             │
│  2   │ Biến & Kiểu DL     │ ✅ Đạt      │ 80             │
│  3   │ Vòng lặp           │ ❌ Chưa đạt │ 65             │
│  4   │ Hàm số             │ — Chưa làm  │ —              │
└───────────────────────────────────────────────────────────┘
```

**Components:**
- `Descriptions` thông tin học sinh
- `Progress` tổng khóa học
- `Table` tiến độ bài học
- `Tag` trạng thái: xanh (Đạt) / đỏ (Chưa đạt) / xám (Chưa làm)

---

## T-06. Khóa học đã gán — `/courses`

**Layout:**
```
Tên KH         | Ngành | Level    | Số lớp | Action
Python Cơ bản  | CNTT  | Cơ bản   |   2    |  →
JS Nâng cao    | CNTT  | Nâng cao |   1    |  →
```

- Click → → expand inline danh sách bài học của KH đó
- Click tên bài học → redirect `/courses/:courseId/lessons/:lessonId/slides`

---

## T-07. Quản lý Slide — `/courses/:courseId/lessons/:lessonId/slides`

**Layout:**
```
┌───────────────────────────────────────────────────────────┐
│  Slide bài giảng: Bài 5 — Vòng lặp trong Python          │
│                                                           │
│  Slide hiện tại:                                         │
│  ┌───────────────────────────────────────────────────┐   │
│  │  📄 slide_bai5.pdf   ·   1.2 MB   ·   01/02/2026 │   │
│  │                                    [👁 Xem] [🗑]  │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
│  ┌───────────────────────────────────────────────────┐   │
│  │   ⬆  Kéo & thả file PDF vào đây                  │   │
│  │      hoặc  [Chọn file]                            │   │
│  │   Tối đa 20MB · Chỉ nhận file PDF                │   │
│  └───────────────────────────────────────────────────┘   │
│  ⚠️ Upload mới sẽ thay thế slide cũ                      │
└───────────────────────────────────────────────────────────┘
```

**Logic:**
- `Upload.Dragger` chỉ nhận `.pdf`, max 20MB
- Upload → `POST /lessons/:lessonId/slides` (multipart/form-data)
- Progress bar trong lúc upload
- Xem 👁 → Modal với `react-pdf` viewer (có nút prev/next trang)
- Xóa 🗑 + confirm → `DELETE /lessons/:lessonId/slides`

---

## Quy tắc chung cho cả 2 phần

**Loading states:**
- Dùng `Skeleton` cho nội dung đang load (text, list, table)
- Dùng Spinner trên Button khi đang submit
- Không bao giờ để màn hình trắng khi load

**Error handling:**
- 401 → clear token → redirect `/login` của app tương ứng
- 403 → hiện trang "Không có quyền truy cập"
- Network error → toast đỏ "Không thể kết nối, kiểm tra mạng"

**Empty states:**
- Mọi danh sách trống đều có icon + message tiếng Việt + CTA button

**Confirm trước khi xóa:**
- Mọi action xóa đều cần `ConfirmModal` từ `packages/ui`

**Ngôn ngữ:**
- 100% tiếng Việt: label, placeholder, error message, toast, confirm text

**AI Chat (chỉ S-11 và S-12):**
- Floating button 💬 chỉ xuất hiện trong trang học và làm bài
- Trong S-12 (đang làm bài): body request phải có `{ isBeforeSubmit: true }` để server biết chỉ trả hint
- Trong S-11 sau khi đã nộp bài: `{ isBeforeSubmit: false }` → server trả phân tích đầy đủ
