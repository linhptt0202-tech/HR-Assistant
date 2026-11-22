# UI/UX Design Prompt — AI-Assisted Performance & Bonus Hub

> **Mục đích:** Tài liệu prompt dùng cho công cụ thiết kế/generate giao diện web (Figma AI, Stitch, v0, Lovable, Bolt hoặc AI UI builder tương tự).
>
> **Nguồn nghiệp vụ:** BRD — Hệ thống Đánh giá Hiệu suất & Đề xuất Thưởng Minh bạch, phiên bản 1.0, ngày 19/11/2026.
>
> **Nguyên tắc:** Thiết kế bám sát nghiệp vụ BRD. Không tự ý thay đổi công thức, quyền hạn, điều kiện chuyển trạng thái hoặc trách nhiệm của AI. Những nội dung BRD còn là câu hỏi mở phải được thể hiện dưới dạng cấu hình/chỗ chờ xác nhận, không tự biến thành chính sách đã chốt.

---

# PHẦN A — PROMPT TỔNG QUAN (DÁN VÀO AI DESIGN TOOL)

## 1. Vai trò và mục tiêu

Bạn là Senior Product Designer / UX Architect có hơn 10 năm kinh nghiệm thiết kế các sản phẩm Enterprise SaaS, HR Tech, Performance Management và Fintech Dashboard.

Hãy thiết kế một web application hoàn chỉnh có tên:

**AI-Assisted Performance & Bonus Hub**  
**Hệ thống Đánh giá Hiệu suất & Đề xuất Thưởng Minh bạch**

Đây là nền tảng giúp doanh nghiệp SME (khoảng 20–200 nhân viên) số hóa quy trình đánh giá hiệu suất, tổng hợp điểm, xếp hạng, đề xuất phân bổ quỹ thưởng và phê duyệt kết quả minh bạch.

Sản phẩm không phải website giới thiệu (landing page), không phải dashboard CRUD đơn giản. Đây là ứng dụng nghiệp vụ có workflow nhiều trạng thái, phân quyền theo vai trò, dữ liệu nhân sự nhạy cảm, công thức tính điểm/thưởng và các thao tác cần audit log.

Mục tiêu thiết kế:

1. HR có thể cấu hình kỳ đánh giá, bộ tiêu chí, trọng số, quỹ thưởng, import dữ liệu, rà soát cảnh báo và lập đề xuất.
2. Nhân viên tự đánh giá theo từng tiêu chí và xem kết quả cá nhân sau khi công bố.
3. Quản lý đánh giá nhân viên thuộc phạm vi quản lý, có căn cứ và nhận xét cụ thể.
4. Giám đốc xem xét, phê duyệt hoặc từ chối kỳ đánh giá với lý do rõ ràng.
5. Kế toán xem và xuất bảng đề xuất thưởng.
6. Hệ thống giải thích được điểm số và cách phân bổ thưởng; AI chỉ đóng vai trò hỗ trợ, không thay con người quyết định.

## 2. Định hướng visual design

Chọn phong cách **Modern Enterprise SaaS Dashboard** làm hệ thống thiết kế chính, kết hợp trải nghiệm thân thiện, ít phức tạp ở khu vực nhân viên.

### 2.1. Tính cách thương hiệu

- Chuyên nghiệp, minh bạch, đáng tin cậy.
- Hiện đại, tinh gọn, có tính hệ thống.
- Dữ liệu dễ đọc, dễ so sánh, dễ truy vết.
- Không quá màu mè, không dùng gradient dày đặc.
- Tránh cảm giác giao diện quản trị cũ hoặc bảng Excel được đưa lên web.
- AI có nhận diện riêng nhưng không được tạo cảm giác AI là người ra quyết định.

### 2.2. Màu sắc đề xuất

Sử dụng light theme làm mặc định.

- Primary: Navy / Royal Blue (`#1E3A8A` hoặc tương đương).
- Primary action: Blue (`#2563EB`).
- Background: Off-white / Light Gray (`#F8FAFC`).
- Surface: White (`#FFFFFF`).
- Text primary: Slate 900 (`#0F172A`).
- Text secondary: Slate 500 (`#64748B`).
- Border: Slate 200 (`#E2E8F0`).
- Success: Green (`#16A34A`).
- Warning: Amber (`#D97706`).
- Danger: Red (`#DC2626`).
- AI accent: Violet (`#7C3AED`), chỉ dùng cho nội dung gợi ý AI.

Màu xếp hạng:
- S: Emerald / Green đậm.
- A: Blue.
- B: Amber.
- C: Slate hoặc Red nhạt.

Không chỉ dùng màu để biểu đạt trạng thái; luôn có nhãn chữ hoặc icon đi kèm. Đảm bảo contrast và khả năng đọc.

### 2.3. Typography và layout

- Font sans-serif hiện đại, ưu tiên Inter hoặc tương đương.
- Desktop-first cho khu vực HR, Quản lý, Giám đốc và Kế toán.
- Responsive cho tablet/mobile; nhân viên phải thao tác tự đánh giá và xem kết quả tốt trên điện thoại.
- Desktop: sidebar trái cố định, topbar, vùng nội dung chính.
- Nội dung dùng max-width hợp lý, khoảng trắng rõ ràng.
- Dùng card cho KPI/summary, table cho dữ liệu cần so sánh, chart cho xu hướng/phân bổ.
- Form dài chia thành section/stepper, có autosave hoặc cảnh báo chưa lưu khi phù hợp.
- Có breadcrumb, page title, mô tả ngắn, primary action rõ ràng.
- Ưu tiên hierarchy và khả năng scan nhanh hơn trang trí.

### 2.4. Thành phần UI dùng xuyên suốt

Thiết kế reusable design system gồm:
- Sidebar navigation có nhóm menu theo vai trò.
- Topbar: tên kỳ đang chọn, thông báo, trợ giúp, avatar/profile, role badge.
- Breadcrumb.
- KPI cards.
- Data table có search, filter, sort, pagination, bulk action khi hợp lý.
- Status badge.
- Rating badge S/A/B/C.
- Progress bar và stepper quy trình.
- Tabs.
- Modal xác nhận hành động quan trọng.
- Drawer xem chi tiết nhân viên/cảnh báo.
- Form validation và inline error.
- Empty state, loading skeleton, error state, success state.
- Toast notification.
- Tooltip giải thích công thức/thuật ngữ.
- Audit timeline.
- Chart có legend, tooltip, nhãn và đơn vị rõ ràng.
- AI insight panel có nhãn “Gợi ý AI — cần con người rà soát”.
- Dialog bắt buộc nhập lý do khi điều chỉnh, từ chối, bỏ qua cảnh báo nghiêm trọng hoặc mở lại kỳ.

---

# PHẦN B — NGHIỆP VỤ BẮT BUỘC PHẢI TUÂN THỦ

## 3. Vai trò người dùng

Thiết kế trải nghiệm và quyền truy cập theo đúng 5 vai trò:

### 3.1. Nhân viên (Employee)

Được phép:
- Xem kỳ đánh giá được giao.
- Tự đánh giá theo từng tiêu chí và nhập ghi chú.
- Lưu nháp/gửi tự đánh giá.
- Xem tiêu chí, điểm, xếp hạng và kết quả của chính mình sau khi kỳ Published.
- Gửi phản hồi/khiếu nại nếu tính năng này được bật trong phạm vi triển khai.

Không được:
- Xem điểm, nhận xét hoặc thưởng của nhân viên khác.
- Xem dashboard toàn công ty.
- Chỉnh điểm quản lý chấm.
- Xem kết quả trước khi công bố.

### 3.2. Quản lý trực tiếp (Manager)

Được phép:
- Xem danh sách nhân viên thuộc đơn vị mình quản lý.
- Chấm điểm từng tiêu chí và viết nhận xét.
- Xem điểm tự đánh giá để tham chiếu và xem độ chênh lệch.
- Xem dữ liệu KPI/chấm công được cấp quyền.
- Xem kết quả cá nhân và kết quả phòng/đơn vị mình theo phạm vi quyền.
- Xem và xử lý gợi ý/cảnh báo AI: chấp nhận, chỉnh sửa hoặc bỏ qua; hành động phải được ghi log.
- Bổ sung nhận xét tham khảo cho nhân viên chuyển phòng ban giữa kỳ nếu có dữ liệu.

Không được:
- Tự chấm điểm cho chính mình.
- Chấm nhân viên ngoài đơn vị mình quản lý.
- Tự thay đổi công thức tính thưởng.
- Tự phê duyệt kỳ.
- Coi cảnh báo AI là kết luận thiên vị.

### 3.3. HR / Admin hệ thống

Được phép:
- Tạo và cấu hình kỳ đánh giá.
- Cấu hình nhóm tiêu chí, tiêu chí con, trọng số, thang điểm, ngưỡng xếp hạng và hệ số thưởng.
- Gán nhân viên và quản lý.
- Import dữ liệu chấm công/KPI bằng CSV/Excel.
- Theo dõi tiến độ tự đánh giá và quản lý đánh giá.
- Xem toàn bộ điểm, nhận xét, kết quả và cảnh báo AI.
- Thực hiện Calibration và điều chỉnh điểm ở trạng thái Calibration.
- Nhập quỹ thưởng, xem phương án phân bổ và chạy mô phỏng.
- Loại nhân viên khỏi danh sách thưởng kèm lý do.
- Lập đề xuất để Giám đốc duyệt.
- Mở lại kỳ Approved/Published về Calibration với lý do và thông báo người liên quan.
- Xuất Excel/PDF.
- Xem audit log.

Không được:
- Tự phê duyệt cuối kỳ đánh giá của chính mình; HR chỉ đề xuất.
- Sửa điểm sau Approved nếu chưa mở lại kỳ.
- Để AI tự thay đổi điểm, xếp hạng, số tiền hoặc trạng thái.

### 3.4. Giám đốc (Director)

Được phép:
- Xem dashboard toàn công ty.
- Xem phân bổ xếp hạng, kết quả, đề xuất thưởng và giải thích phân bổ.
- Xem cảnh báo AI và phản hồi xử lý.
- Phê duyệt hoặc từ chối kỳ; khi từ chối phải nhập lý do và kỳ quay lại Calibration.
- Xác nhận lại các điều chỉnh điểm làm đổi hạng hoặc lệch quá 1.0 điểm.
- Xem/xuất báo cáo Excel/PDF.

Không được:
- Thay vai trò AI để tự động tính hoặc thay đổi kết quả.
- Phê duyệt mà không đáp ứng các điều kiện bắt buộc của kỳ.

### 3.5. Kế toán (Accountant)

Được phép:
- Xem bảng đề xuất thưởng được phép truy cập.
- Xuất Excel/PDF gồm mã nhân viên, họ tên, phòng ban, điểm, xếp hạng, hệ số và số tiền đề xuất.
- Kiểm tra tổng tiền và đối chiếu quỹ.

Không được:
- Chỉnh điểm, xếp hạng hoặc công thức phân bổ.
- Thực hiện phê duyệt nghiệp vụ nếu không được cấp quyền khác.

**Quan trọng:** Menu, dữ liệu, nút hành động và phạm vi truy cập phải thay đổi theo role. Không chỉ ẩn nút ở frontend; thiết kế cần thể hiện rõ các trạng thái được phép/không được phép.

## 4. Quy trình và trạng thái kỳ đánh giá

Thể hiện workflow bằng stepper/timeline dễ hiểu:

1. **Draft** — HR đang thiết lập kỳ.
2. **Self-review** — Nhân viên tự đánh giá.
3. **Manager-review** — Quản lý chấm điểm và nhận xét.
4. **Calibration** — HR rà soát, xử lý cảnh báo, điều chỉnh điểm và chuẩn bị đề xuất thưởng.
5. **Approved** — Giám đốc/người được ủy quyền đã duyệt; dữ liệu bị khóa.
6. **Published** — HR công bố kết quả cho nhân viên.

### 4.1. Điều kiện chuyển trạng thái cần thể hiện trong UI

- Draft → Self-review: tổng trọng số nhóm = 100%; có ít nhất một nhân viên và quản lý được gán.
- Self-review → Manager-review: đến hạn hoặc tất cả nhân viên đã nộp. Người chưa nộp được đánh dấu “Không tự đánh giá”; quản lý vẫn chấm được.
- Manager-review → Calibration: mọi nhân viên có điểm quản lý hoặc HR chủ động đóng kỳ.
- Calibration → Approved: HR đã xử lý hết cảnh báo mức Nghiêm trọng; tổng thưởng không vượt quỹ.
- Nếu Giám đốc từ chối: quay lại Calibration, phải có lý do.
- Approved → Published: Giám đốc đã duyệt.
- Approved/Published → Calibration: chỉ HR được mở lại, bắt buộc có lý do và thông báo người liên quan.

### 4.2. Quá hạn và ngoại lệ

- Hệ thống nhắc nhân viên trước hạn tự đánh giá 1 ngày (mốc cấu hình được).
- Quản lý chưa chấm: HR được nhắc; quá hạn 3 ngày, HR có thể chấm thay hoặc gán lại quản lý; phải ghi log.
- Không cho hoàn tất/duyệt kỳ khi còn thiếu đánh giá bắt buộc hoặc dữ liệu đầu vào chưa hợp lệ.
- Cần có màn hình theo dõi các trường hợp chưa tự đánh giá, quản lý chưa chấm, quá hạn và người phụ trách xử lý.

## 5. Quy tắc tính điểm và xếp hạng

Không tự thay đổi các công thức sau:

### 5.1. Cấu trúc trọng số

- Một kỳ có nhiều nhóm tiêu chí.
- Tổng trọng số các nhóm trong kỳ phải bằng 100%.
- Mỗi nhóm có nhiều tiêu chí con.
- Tổng trọng số các tiêu chí con trong cùng nhóm phải bằng 100%.
- Trọng số được lưu dưới dạng phần trăm, ví dụ 50 tương ứng 50%.
- Không cho mở kỳ nếu tổng trọng số nhóm hoặc trọng số tiêu chí con không bằng 100%.
- HR có thể khai báo tiêu chí con “Không áp dụng” cho chức danh ngay khi cấu hình kỳ.
- Không tự coi tiêu chí không áp dụng là 0 điểm và không tự chia lại trọng số.
- Nếu tiêu chí chưa được khai báo không áp dụng mà thiếu điểm, chặn hoàn tất đánh giá.

### 5.2. Công thức điểm

Điểm nhóm:

`Điểm nhóm = Σ (Điểm tiêu chí con × Trọng số tiêu chí con) / 100`

Điểm tổng:

`Điểm tổng = Σ (Điểm nhóm × Trọng số nhóm) / 100`

- Thang điểm mặc định 0–10, có thể cấu hình.
- Điểm quản lý là căn cứ chính.
- Điểm tự đánh giá chỉ dùng tham chiếu và phát hiện chênh lệch.
- Giữ độ chính xác trong các bước tính; chỉ làm tròn điểm tổng ở bước cuối.
- Điểm tổng hiển thị 2 chữ số thập phân.
- Xếp hạng dùng điểm tổng 2 chữ số thập phân.

### 5.3. Ngưỡng xếp hạng mặc định đề xuất trong BRD

| Xếp hạng | Điều kiện điểm |
|---|---:|
| S | ≥ 9.00 |
| A | ≥ 8.00 và < 9.00 |
| B | ≥ 6.50 và < 8.00 |
| C | < 6.50 |

Các ngưỡng này phải hiển thị là cấu hình theo kỳ, không hard-code vào thiết kế như chính sách bất biến.

### 5.4. Hệ số thưởng theo hạng đề xuất

| Xếp hạng | Hệ số |
|---|---:|
| S | 1.5 |
| A | 1.2 |
| B | 1.0 |
| C | 0 |

Mỗi tiêu chí quản lý chấm điểm ≥ 9 hoặc ≤ 4 bắt buộc có nhận xét. UI cần hiển thị validation tại tiêu chí tương ứng và không cho gửi nếu thiếu nhận xét.

## 6. Quy tắc phân bổ thưởng

Công thức chuẩn của hệ thống là kết quả chính thức. AI không được thay đổi số tiền.

- Hệ số thâm niên đề xuất: dưới 1 năm = 1.0; từ 1 đến dưới 3 năm = 1.05; từ 3 năm trở lên = 1.10. Đây là đề xuất còn cần Business xác nhận, vì vậy thiết kế như cấu hình HR theo kỳ.
- Trọng số phân bổ nhân viên = Hệ số thưởng theo hạng × Hệ số thâm niên.
- Nhân viên đủ điều kiện = không bị loại và có điểm quản lý.
- Nhân viên bị loại do vi phạm kỷ luật nghiêm trọng vẫn được đánh giá/xếp hạng nhưng thưởng = 0 và không nằm trong mẫu số.
- HR phải đánh dấu loại khỏi danh sách thưởng kèm lý do.
- Thưởng đề xuất = Quỹ thưởng × Trọng số phân bổ nhân viên / Tổng trọng số phân bổ của nhân viên đủ điều kiện.
- Tổng thưởng không được vượt quỹ.
- Tiền thưởng làm tròn xuống đơn vị 1.000 VNĐ.
- Phần dư do làm tròn được phân theo thứ tự phần lẻ lớn nhất, cộng 1.000 VNĐ lần lượt đến khi hết, không vượt quỹ.
- Nếu tổng trọng số phân bổ = 0: không phân bổ, hiển thị lỗi và giữ nguyên quỹ.

UI cần có:
- Tổng quỹ thưởng.
- Tổng đã phân bổ.
- Quỹ còn lại.
- Tổng số nhân viên đủ điều kiện.
- Số nhân viên bị loại và lý do.
- Bảng chi tiết hệ số hạng, hệ số thâm niên, trọng số phân bổ, số tiền trước/sau làm tròn.
- Kiểm tra tổng sau làm tròn.
- Cảnh báo khi vượt quỹ hoặc không có người đủ điều kiện.
- Nút chạy lại công thức sau khi HR điều chỉnh dữ liệu.
- Khu vực AI giải thích và mô phỏng kịch bản, tách biệt rõ với kết quả công thức chính thức.

## 7. Vai trò AI — giới hạn bắt buộc

Thiết kế AI như một lớp hỗ trợ ra quyết định, không phải người ra quyết định.

### 7.1. Review Summarizer

- Tóm tắt thành tích nổi bật trong kỳ từ nhận xét và dữ liệu KPI.
- Từng ý tóm tắt phải dẫn lại nhận xét hoặc dữ liệu KPI làm căn cứ.
- Cho phép người dùng xem nguồn dẫn chứng.
- Không tạo thành tích không có trong dữ liệu.

### 7.2. Bias Detector

Phát hiện tín hiệu cần rà soát:
- Điểm cao nhưng nhận xét tiêu cực hoặc ngược lại.
- Nhận xét quá ngắn/chung chung.
- Quản lý chấm quá đồng đều hoặc lệch so với mặt bằng.
- Chênh lệch lớn giữa tự đánh giá và quản lý đánh giá.

Hai mức cảnh báo:
- **Bất thường:** cần xem lại.
- **Nghiêm trọng:** phải có phản hồi của người duyệt.

Không bao giờ hiển thị “Kết luận thiên vị”. Dùng cụm từ **“Tín hiệu cần rà soát”**.

Người dùng có thể:
- Chấp nhận gợi ý.
- Chỉnh sửa.
- Bỏ qua cảnh báo; với cảnh báo nghiêm trọng cần phản hồi/lý do.
- Mọi hành động đều được ghi log.

### 7.3. Bonus Allocator

- Hệ thống tính số tiền theo công thức chuẩn.
- AI giải thích vì sao mỗi nhân viên nhận mức thưởng tương ứng.
- AI mô phỏng các kịch bản thay đổi giả định.
- AI không tự thay đổi số tiền chính thức.
- Kết quả mô phỏng phải được phân biệt với phương án chính thức.

### 7.4. AI lỗi hoặc timeout

- Hiển thị trạng thái AI không khả dụng/đang thử lại.
- Ghi nhận lỗi.
- Cho phép tiếp tục các bước nghiệp vụ không phụ thuộc AI.
- Không khóa toàn bộ quy trình chỉ vì AI lỗi.
- Không giả lập nội dung AI thành kết quả đã chạy thật.

### 7.5. Bảo mật dữ liệu AI

- Dữ liệu gửi AI được ẩn danh bằng mã nhân viên thay cho họ tên.
- Không gửi thông tin nhạy cảm không cần thiết.
- UI không được hiển thị thông tin nhạy cảm trong prompt/log AI không phù hợp.

## 8. Import dữ liệu và audit log

### 8.1. Import CSV/Excel

File mẫu có các trường:

`employee_id, period, working_days, late_count, leave_days, kpi_achievement_pct`

Luồng import:
1. Chọn/tải file.
2. Hiển thị tên file và thông tin cơ bản.
3. Preview dữ liệu.
4. Kiểm tra trùng khóa (mã nhân viên + kỳ), trường bắt buộc và định dạng.
5. Hiển thị số dòng hợp lệ/lỗi.
6. Báo lỗi theo dòng, cột và lý do.
7. Dòng trùng: từ chối dòng sau.
8. Dòng thiếu trường/sai định dạng: bỏ qua và liệt kê lỗi.
9. Chỉ nhập các dòng hợp lệ sau khi HR xác nhận.

Không được chỉ có một nút Upload rồi báo thành công chung chung.

### 8.2. Audit log

Lưu và hiển thị:
- Người thực hiện.
- Hành động.
- Thời gian.
- Giá trị cũ.
- Giá trị mới.
- Lý do.
- Đối tượng/kỳ liên quan.

Các thay đổi điểm/thưởng phải có log. Không cho lưu điều chỉnh nếu thiếu lý do.

---

# PHẦN C — CẤU TRÚC SẢN PHẨM VÀ MÀN HÌNH

## 9. Application shell

Thiết kế một application shell nhất quán:
- Sidebar trái có logo/tên sản phẩm.
- Menu thay đổi theo role.
- Topbar có tên kỳ đang chọn, notification, avatar và menu tài khoản.
- Main content có breadcrumb, page title, subtitle và actions.
- Có role badge rõ ràng khi demo đổi vai trò.
- Có global period selector nếu người dùng được phép xem nhiều kỳ.
- Có trạng thái dữ liệu demo/mock data nếu đang dùng dữ liệu mẫu.

## 10. Màn hình dùng chung

### 10.1. Đăng nhập

- Email/tài khoản và mật khẩu.
- Hiện/ẩn mật khẩu.
- Quên mật khẩu.
- Logo và tên sản phẩm.
- Giao diện doanh nghiệp, tối giản.
- Có thể có lựa chọn “Ghi nhớ đăng nhập” nếu sản phẩm triển khai hỗ trợ.

### 10.2. Thông báo

- Danh sách thông báo theo thời gian.
- Nhắc sắp đến hạn tự đánh giá.
- Nhắc quản lý chưa chấm.
- Thông báo khi HR điều chỉnh điểm.
- Thông báo kỳ được duyệt/công bố.
- Thông báo khi kỳ được mở lại.
- Trạng thái đã đọc/chưa đọc.

### 10.3. Hồ sơ cá nhân

- Thông tin tài khoản cơ bản.
- Vai trò và đơn vị.
- Đăng xuất.
- Không đưa các chức năng quản lý nhân sự toàn diện ngoài phạm vi BRD vào đây.

---

# PHẦN D — MÀN HÌNH THEO TỪNG VAI TRÒ

## 11. HR Dashboard

Đây là dashboard nghiệp vụ quan trọng nhất. Thiết kế dạng control center.

### Nội dung chính

KPI cards:
- Tổng nhân viên trong kỳ.
- Tỷ lệ hoàn thành tự đánh giá.
- Tỷ lệ hoàn thành quản lý đánh giá.
- Số trường hợp quá hạn.
- Số cảnh báo AI chưa xử lý.
- Tổng quỹ thưởng / tổng thưởng dự kiến (nếu kỳ đã đến giai đoạn phù hợp).

Các khu vực:
1. **Tiến độ kỳ đánh giá:** stepper Draft → Self-review → Manager-review → Calibration → Approved → Published.
2. **Việc cần xử lý:** nhân viên chưa tự đánh giá, quản lý chưa chấm, cảnh báo nghiêm trọng, dữ liệu import lỗi.
3. **Phân bổ xếp hạng:** biểu đồ S/A/B/C theo phòng ban.
4. **Tổng quan quỹ thưởng:** quỹ, số đã phân bổ, số còn lại.
5. **Hoạt động gần đây:** timeline audit.
6. **Quick actions:** tạo kỳ, import dữ liệu, vào Calibration, xuất báo cáo.

Không hiển thị dữ liệu ngoài phạm vi quyền HR.

## 12. Quản lý kỳ đánh giá (HR)

### 12.1. Danh sách kỳ

Bảng gồm:
- Mã kỳ.
- Tên kỳ.
- Loại tháng/quý.
- Ngày bắt đầu/kết thúc.
- Số nhân viên tham gia.
- Trạng thái.
- Tiến độ.
- Quỹ thưởng.
- Người tạo/cập nhật.
- Hành động theo quyền.

Bộ lọc:
- Trạng thái.
- Loại kỳ.
- Thời gian.
- Tìm kiếm tên/mã kỳ.

### 12.2. Tạo kỳ đánh giá — wizard nhiều bước

Bước 1: Thông tin kỳ
- Tên kỳ.
- Loại kỳ: tháng/quý.
- Ngày bắt đầu/kết thúc.
- Deadline tự đánh giá.
- Deadline quản lý đánh giá.
- Ngày chốt kỳ.
- Quỹ thưởng.

Bước 2: Chọn nhân viên và quản lý
- Chọn nhân viên tham gia.
- Phòng ban/chức danh.
- Quản lý trực tiếp.
- Kiểm tra nhân viên chưa được gán quản lý.
- Phòng ban tại ngày chốt kỳ là căn cứ đánh giá.

Bước 3: Cấu hình nhóm tiêu chí
- Tên nhóm, mô tả, trọng số, thứ tự.
- Ví dụ mẫu trong BRD:
  - KPI công việc: 50%.
  - Chuyên cần/Kỷ luật: 20%.
  - Thái độ & Đóng góp team: 30%.
- Tổng trọng số nhóm có progress/validation phải bằng 100%.

Bước 4: Cấu hình tiêu chí con
- Tên tiêu chí.
- Mô tả/hướng dẫn chấm.
- Trọng số trong nhóm.
- Thang điểm.
- Chức danh áp dụng.
- Trạng thái “Không áp dụng” nếu HR khai báo từ đầu.
- Tổng trọng số tiêu chí con trong từng nhóm phải bằng 100%.

Bước 5: Cấu hình xếp hạng và thưởng
- Ngưỡng S/A/B/C.
- Hệ số thưởng theo hạng.
- Hệ số thâm niên.
- Quy tắc làm tròn.
- Hiển thị rõ đây là cấu hình áp dụng riêng cho kỳ.

Bước 6: Review và xác nhận
- Tổng quan thông tin kỳ.
- Số nhân viên/quản lý.
- Trọng số.
- Ngưỡng xếp hạng.
- Quỹ thưởng.
- Các validation còn thiếu.
- Chỉ bật “Mở kỳ” khi điều kiện bắt buộc hợp lệ.

Có thể lưu Draft khi chưa hoàn tất. Không cho chuyển sang Self-review nếu điều kiện BRD chưa thỏa.

### 12.3. Chi tiết kỳ đánh giá

Dùng tabs:
- Tổng quan.
- Nhân viên tham gia.
- Tiêu chí & cấu hình.
- Tiến độ.
- Điểm & xếp hạng.
- Cảnh báo AI.
- Phân bổ thưởng.
- Lịch sử thao tác.

Hiển thị trạng thái kỳ và các hành động hợp lệ theo trạng thái hiện tại.

## 13. Import dữ liệu chấm công/KPI (HR)

Thiết kế trang import chuyên nghiệp:
- Download template CSV/Excel.
- Drag-and-drop file.
- Chọn kỳ đánh giá.
- Preview dạng bảng.
- Summary: tổng dòng, hợp lệ, lỗi, trùng.
- Highlight cell lỗi.
- Hiển thị dòng, cột, giá trị lỗi và lý do.
- Tab “Tất cả / Hợp lệ / Lỗi / Trùng”.
- Nút “Xác nhận nhập dữ liệu hợp lệ”.
- Nút hủy/thay file.
- Import result summary sau khi hoàn tất.

## 14. Employee Self-review

Đây là màn hình cần đơn giản, thân thiện, có hướng dẫn rõ ràng.

### 14.1. Dashboard nhân viên

- Kỳ đánh giá đang mở.
- Deadline.
- Trạng thái tự đánh giá.
- Tiến độ hoàn thành.
- CTA “Bắt đầu tự đánh giá” hoặc “Tiếp tục”.
- Các kỳ trước và kết quả đã công bố (chỉ của chính nhân viên).
- Thông báo liên quan.

### 14.2. Form tự đánh giá

- Hiển thị tên kỳ và thông tin deadline.
- Danh sách nhóm tiêu chí.
- Mỗi nhóm có trọng số và mô tả.
- Mỗi tiêu chí con có tên, hướng dẫn, trọng số.
- Input điểm theo thang điểm cấu hình (mặc định 0–10).
- Textarea ghi chú/thành tích/bằng chứng.
- Progress hoàn thành.
- Lưu nháp.
- Xem trước.
- Gửi tự đánh giá.
- Confirm dialog trước khi gửi.
- Sau khi gửi: hiển thị trạng thái đã nộp và thời gian nộp.

Không hiển thị điểm quản lý hoặc kết quả thưởng trước khi công bố.

### 14.3. Trường hợp quá hạn/chưa tự đánh giá

Nếu đã hết hạn và nhân viên chưa nộp:
- Hiển thị nhãn “Không tự đánh giá”.
- Thông báo rằng quản lý vẫn có thể thực hiện đánh giá theo quy trình.
- Không tạo cảm giác hệ thống đã tự gán điểm 0.

## 15. Manager Review

### 15.1. Dashboard quản lý

- Số nhân viên cần đánh giá.
- Đã hoàn thành.
- Chưa bắt đầu.
- Đang làm.
- Quá hạn.
- Cảnh báo cần rà soát.
- Danh sách nhân viên thuộc phạm vi quản lý.

### 15.2. Danh sách nhân viên cần chấm

Bảng:
- Mã nhân viên.
- Họ tên.
- Chức danh.
- Phòng ban.
- Trạng thái tự đánh giá.
- Trạng thái quản lý đánh giá.
- Deadline.
- Điểm tự đánh giá (nếu đã nộp và được phép xem).
- Hành động “Đánh giá”.

Chỉ hiển thị nhân viên thuộc đơn vị quản lý.

### 15.3. Màn hình chấm điểm chi tiết

Bố cục đề xuất 2 cột:
- Cột chính: tiêu chí và form chấm điểm.
- Cột phụ: tự đánh giá, KPI/chấm công liên quan, lịch sử/ghi chú tham khảo.

Với từng tiêu chí:
- Tên và mô tả.
- Trọng số.
- Điểm tự đánh giá (tham khảo).
- Điểm quản lý.
- Ô nhận xét.
- Evidence/nguồn dữ liệu nếu có.
- Hiển thị chênh lệch giữa điểm tự đánh giá và quản lý.

Validation:
- Nếu điểm ≥ 9 hoặc ≤ 4, bắt buộc có nhận xét.
- Không cho gửi khi thiếu điểm bắt buộc.
- Không cho quản lý tự chấm chính mình.
- Không cho chấm ngoài phạm vi quản lý.

Sau khi hoàn tất:
- Hiển thị điểm nhóm.
- Hiển thị điểm tổng 2 chữ số.
- Hiển thị xếp hạng.
- Hiển thị xác nhận trước khi gửi.
- Ghi nhận người chấm và thời gian.

### 15.4. AI Review Insights

Panel riêng:
- Tóm tắt nhận xét.
- Thành tích nổi bật.
- Tín hiệu cần rà soát.
- Mức Bất thường/Nghiêm trọng.
- Lý do cảnh báo.
- Nguồn dẫn chứng có thể mở xem.
- Hành động Chấp nhận / Chỉnh sửa / Bỏ qua.
- Bắt buộc ghi nhận lý do khi xử lý theo quy định.

Dùng nhãn “AI gợi ý”, không dùng ngôn ngữ kết luận.

## 16. Calibration Center (HR)

Đây là màn hình trọng tâm của sản phẩm. Thiết kế như một workspace kiểm soát chất lượng đánh giá và chuẩn bị phê duyệt.

### 16.1. Tổng quan Calibration

KPI:
- Tổng nhân viên.
- Đã có điểm quản lý.
- Thiếu đánh giá.
- Cảnh báo Bất thường.
- Cảnh báo Nghiêm trọng.
- Số điểm đã điều chỉnh.
- Số trường hợp cần Giám đốc xác nhận lại.

Các biểu đồ:
- Phân bổ S/A/B/C theo phòng ban.
- So sánh điểm trung bình giữa phòng ban.
- Phân bố điểm.
- Số cảnh báo theo loại/mức độ.

### 16.2. Bảng Calibration

Cột đề xuất:
- Mã NV.
- Họ tên.
- Phòng ban.
- Chức danh.
- Điểm tự đánh giá.
- Điểm quản lý.
- Điểm tổng.
- Xếp hạng.
- Số cảnh báo.
- Trạng thái xử lý.
- Thưởng dự kiến.
- Hành động xem chi tiết.

Bộ lọc:
- Phòng ban.
- Quản lý.
- Xếp hạng.
- Mức cảnh báo.
- Có/không điều chỉnh.
- Trạng thái đánh giá.

### 16.3. Chi tiết điều chỉnh điểm

- Điểm ban đầu.
- Điểm đề xuất mới.
- Chênh lệch.
- Xếp hạng trước/sau.
- Ảnh hưởng đến hệ số thưởng và số tiền dự kiến.
- Lý do điều chỉnh bắt buộc.
- Người điều chỉnh.
- Thời gian.
- Nguồn/căn cứ.
- Nút lưu điều chỉnh.

Chỉ HR được điều chỉnh điểm ở Calibration.
Nếu điều chỉnh làm đổi hạng hoặc lệch quá 1.0 điểm, hiển thị trạng thái “Cần Giám đốc xác nhận lại” trước khi Approved.
Không ghi đè mất giá trị ban đầu; phải hiển thị lịch sử trước/sau.
Thông báo quản lý liên quan khi điểm nhân viên của họ bị HR điều chỉnh.

### 16.4. Xử lý cảnh báo AI

- Danh sách cảnh báo theo mức độ.
- Tên/mã nhân viên theo quyền.
- Tiêu chí liên quan.
- Điểm và nhận xét liên quan.
- Lý do AI gắn cờ.
- Bằng chứng tham chiếu.
- Trạng thái xử lý.
- Người xử lý.
- Thời gian.
- Hành động Chấp nhận / Chỉnh sửa / Bỏ qua.
- Cảnh báo Nghiêm trọng cần phản hồi của người duyệt.
- Không có trạng thái “Đã kết luận thiên vị”.

### 16.5. Điều kiện hoàn tất Calibration

Hiển thị checklist:
- Đã xử lý hết cảnh báo Nghiêm trọng.
- Không còn thiếu đánh giá bắt buộc.
- Dữ liệu import hợp lệ.
- Tổng thưởng không vượt quỹ.
- Các trường hợp cần Giám đốc xác nhận đã được xác nhận.
- Có đầy đủ log điều chỉnh.

Chỉ bật “Gửi Giám đốc phê duyệt” khi thỏa điều kiện.

## 17. Bonus Allocation Center (HR)

### 17.1. Tổng quan quỹ thưởng

Cards:
- Tổng quỹ thưởng.
- Tổng thưởng theo công thức.
- Quỹ còn lại.
- Số nhân viên đủ điều kiện.
- Số nhân viên bị loại.
- Trạng thái phương án.

### 17.2. Bảng phân bổ

Cột:
- Mã NV.
- Họ tên.
- Phòng ban.
- Điểm tổng.
- Xếp hạng.
- Hệ số hạng.
- Thâm niên.
- Hệ số thâm niên.
- Trọng số phân bổ.
- Thưởng trước làm tròn.
- Thưởng đề xuất sau làm tròn.
- Trạng thái đủ điều kiện.
- Lý do loại (nếu có).

### 17.3. Giải thích công thức

Có khu vực “Cách tính thưởng”:
- Hiển thị công thức.
- Giải thích hệ số hạng.
- Giải thích hệ số thâm niên.
- Giải thích trọng số phân bổ.
- Hiển thị cách tính của một nhân viên cụ thể.
- Hiển thị tổng trọng số mẫu số.
- Hiển thị kết quả sau làm tròn và xử lý phần dư.

### 17.4. AI Bonus Allocator

Panel AI riêng biệt:
- “Vì sao nhân viên A nhận mức thưởng này?”
- So sánh hai trường hợp theo dữ liệu được phép.
- Giải thích tác động của hạng và thâm niên.
- Mô phỏng kịch bản: thay đổi quỹ, thay đổi giả định/hệ số cấu hình để xem tác động.
- Nêu rõ đây là mô phỏng, không phải phương án chính thức.
- Không cho AI tự sửa số tiền chính thức.
- Có nút quay về phương án công thức chuẩn.

### 17.5. Kiểm soát ngân sách

- Hiển thị tổng thưởng sau làm tròn.
- Không cho xác nhận nếu vượt quỹ.
- Nếu tổng trọng số phân bổ bằng 0: hiển thị lỗi rõ ràng, giữ nguyên quỹ.
- Hiển thị phần dư và cách phân bổ theo phần lẻ lớn nhất.
- HR có thể chỉnh phương án cuối cùng nếu nghiệp vụ cho phép; mọi điều chỉnh phải ghi lý do và log.

## 18. Director Approval

Dashboard Giám đốc:
- Các kỳ chờ duyệt.
- Tổng quỹ.
- Tổng thưởng đề xuất.
- Số cảnh báo nghiêm trọng.
- Số trường hợp điều chỉnh điểm cần xác nhận.
- Phân bổ xếp hạng theo phòng ban.

Màn hình chi tiết duyệt:
- Thông tin kỳ.
- Tóm tắt quy trình.
- Phân bổ xếp hạng.
- Điểm và xu hướng.
- Tổng quỹ và tổng thưởng.
- Bảng đề xuất thưởng.
- Cảnh báo AI và phản hồi xử lý.
- Danh sách điều chỉnh điểm.
- Audit log.
- Checklist điều kiện duyệt.

Hành động:
- Phê duyệt.
- Từ chối (bắt buộc nhập lý do; chuyển về Calibration).
- Xác nhận lại điều chỉnh điểm.

Không thiết kế nút “AI tự duyệt”.

## 19. Published Results — Nhân viên

Sau khi HR công bố:
- Hiển thị điểm tổng.
- Xếp hạng.
- Điểm theo từng nhóm tiêu chí.
- Nhận xét quản lý theo quyền/chính sách công bố.
- Thành tích nổi bật và căn cứ nếu được công bố.
- Thưởng được duyệt/đề xuất theo chính sách hiển thị đã xác nhận.
- Lịch sử điểm cá nhân qua các kỳ.
- Giải thích cách tính điểm và hệ số.
- CTA phản hồi/khiếu nại nếu tính năng BR-15 được bật.

Không hiển thị dữ liệu của nhân viên khác.

## 20. Reports & Export

Dành cho HR, Giám đốc và Kế toán theo quyền.

Các báo cáo:
- Phân bổ xếp hạng theo phòng ban.
- Lịch sử điểm theo nhân viên qua các kỳ.
- Bảng đề xuất thưởng.
- Tổng hợp quỹ thưởng.
- Báo cáo import.
- Báo cáo cảnh báo AI.
- Audit log.

Export:
- Excel.
- PDF.

Bảng thưởng xuất tối thiểu:
- Mã NV.
- Họ tên.
- Phòng ban.
- Điểm.
- Xếp hạng.
- Hệ số.
- Số tiền đề xuất.

Đảm bảo số liệu export khớp với số liệu trên UI.

## 21. Audit Log

Trang lịch sử thao tác:
- Bộ lọc theo kỳ, người thực hiện, loại hành động, thời gian, nhân viên.
- Timeline hoặc table.
- Giá trị cũ/mới.
- Lý do.
- Người thao tác.
- Timestamp.
- Link tới đối tượng liên quan nếu có quyền.

Không cho người dùng thông thường sửa/xóa log.

## 22. Cấu hình hệ thống

Trong phạm vi BRD:
- Cấu hình thang điểm.
- Cấu hình ngưỡng xếp hạng.
- Cấu hình hệ số thưởng.
- Cấu hình hệ số thâm niên.
- Cấu hình mốc nhắc hạn.
- Cấu hình bộ tiêu chí theo kỳ.
- Cấu hình tiêu chí không áp dụng theo chức danh.

Các cấu hình phải được lưu phiên bản theo từng kỳ. Kỳ đã mở không bị thay đổi bởi cấu hình kỳ sau.

---

# PHẦN E — NAVIGATION THEO ROLE

## 23. Gợi ý menu

### HR
- Tổng quan
- Kỳ đánh giá
- Nhân viên tham gia
- Import dữ liệu
- Calibration
- Phân bổ thưởng
- Báo cáo
- Nhật ký thao tác
- Cấu hình

### Manager
- Tổng quan
- Nhân viên cần đánh giá
- Lịch sử đánh giá
- Kết quả phòng ban
- Thông báo

### Employee
- Trang chủ
- Tự đánh giá
- Kết quả của tôi
- Lịch sử đánh giá
- Thông báo

### Director
- Tổng quan
- Kỳ chờ phê duyệt
- Phân bổ xếp hạng
- Đề xuất thưởng
- Báo cáo
- Lịch sử phê duyệt

### Accountant
- Tổng quan
- Bảng đề xuất thưởng
- Báo cáo
- Xuất dữ liệu

Menu trên là gợi ý IA; chỉ hiển thị các mục phù hợp với ma trận phân quyền BRD.

---

# PHẦN F — TRẠNG THÁI, VALIDATION VÀ EDGE CASES

## 24. Những trạng thái UI phải thiết kế

Với các màn hình quan trọng, tạo đủ:
- Default / normal.
- Loading / skeleton.
- Empty state.
- Error state.
- Success state.
- Disabled action.
- Validation error.
- Permission denied.
- Data unavailable.
- AI loading.
- AI timeout/error.
- Overdue.
- Locked after Approved.
- Reopened to Calibration.

## 25. Các edge case bắt buộc

1. Tổng trọng số nhóm khác 100% → chặn mở kỳ.
2. Tổng trọng số tiêu chí con trong một nhóm khác 100% → chặn mở kỳ.
3. Thiếu nhân viên hoặc quản lý được gán → chặn mở kỳ.
4. Nhân viên không tự đánh giá đúng hạn → đánh dấu “Không tự đánh giá”, quản lý vẫn chấm.
5. Quản lý quá hạn → HR được nhắc và xử lý theo quyền; ghi log.
6. Điểm ≥ 9 hoặc ≤ 4 mà thiếu nhận xét → chặn gửi đánh giá.
7. Quản lý cố chấm chính mình → chặn.
8. Quản lý chấm nhân viên ngoài đơn vị → chặn.
9. Thiếu điểm bắt buộc → không cho hoàn tất.
10. Tiêu chí “Không áp dụng” đã khai báo → không tính 0 và không tự chia lại trọng số.
11. Tiêu chí chưa khai báo không áp dụng mà thiếu điểm → chặn hoàn tất.
12. Import có dòng trùng → từ chối dòng sau.
13. Import thiếu/sai định dạng → bỏ qua dòng lỗi, chỉ rõ dòng/cột/lý do.
14. AI timeout → vẫn tiếp tục được bước không phụ thuộc AI.
15. Cảnh báo Nghiêm trọng chưa có phản hồi → không cho hoàn tất Calibration.
16. Tổng trọng số phân bổ = 0 → không chia quỹ, giữ nguyên quỹ.
17. Tổng thưởng sau làm tròn vượt quỹ → chặn xác nhận.
18. Điều chỉnh điểm đổi hạng hoặc lệch quá 1.0 → cần Giám đốc xác nhận lại.
19. Kỳ Approved → khóa chỉnh sửa.
20. Mở lại kỳ → chỉ HR, bắt buộc lý do và thông báo.
21. Nhân viên bị loại khỏi thưởng → vẫn có điểm/xếp hạng, thưởng 0, không nằm mẫu số.
22. Nhân viên không có quyền xem dữ liệu người khác → không hiển thị qua bảng, chart, URL hoặc detail.
23. Giám đốc từ chối → yêu cầu lý do và chuyển về Calibration.

---

# PHẦN G — RESPONSIVE, ACCESSIBILITY VÀ UX QUALITY

## 26. Responsive

### Desktop
- Ưu tiên đầy đủ sidebar, bảng dữ liệu, chart và panel phụ.
- Calibration/Bonus Allocation tối ưu cho màn hình rộng.
- Có thể dùng sticky header/toolbar khi bảng dài.

### Tablet
- Sidebar thu gọn.
- Bảng có horizontal scroll hoặc chuyển thành card phù hợp.
- Form chấm điểm dễ thao tác cảm ứng.

### Mobile
- Employee flow là ưu tiên cao nhất.
- Form tự đánh giá hiển thị theo nhóm/accordion.
- CTA lưu/gửi dễ thao tác.
- Manager có thể xem danh sách và chấm các trường hợp đơn giản.
- Dashboard HR/Director có thể rút gọn; không cố nhồi mọi bảng phức tạp vào mobile.

## 27. Accessibility và usability

- Contrast đủ cao.
- Font và kích thước input dễ đọc.
- Focus state rõ.
- Form label luôn hiển thị, không chỉ dùng placeholder.
- Validation đặt cạnh trường lỗi.
- Icon có tooltip/accessible label.
- Không dùng màu sắc làm tín hiệu duy nhất.
- Bảng có header rõ, số liệu căn chỉnh nhất quán.
- Định dạng tiền VNĐ có phân tách hàng nghìn.
- Điểm hiển thị 2 chữ số thập phân.
- Ngôn ngữ giao diện mặc định: Tiếng Việt.

## 28. Nội dung và dữ liệu demo

Sử dụng mock data nhất quán, không dùng dữ liệu nhân sự thật.

Tạo dữ liệu mẫu:
- Một doanh nghiệp.
- Một số phòng ban.
- Các vai trò HR, Manager, Employee, Director, Accountant.
- Một kỳ đánh giá mẫu có nhiều trạng thái để demo workflow.
- Nhân viên có xếp hạng S/A/B/C.
- Một số trường hợp tự đánh giá lệch quản lý.
- Một số nhận xét chung chung.
- Một trường hợp điểm cao nhưng nhận xét tiêu cực để demo AI alert.
- Một trường hợp điểm thấp cần giải thích.
- Một nhân viên bị loại khỏi danh sách thưởng có lý do.
- Một trường hợp import có dòng hợp lệ, trùng, thiếu trường và sai định dạng.
- Một trường hợp điều chỉnh điểm làm đổi hạng.
- Một trường hợp AI timeout.
- Một trường hợp tổng quỹ gần chạm ngưỡng.

Dữ liệu demo phải nhất quán giữa dashboard, bảng chi tiết, chart, báo cáo và export preview.

---

# PHẦN H — OUTPUT MONG MUỐN TỪ AI DESIGN TOOL

## 29. Yêu cầu deliverables

Hãy tạo thiết kế có tính hệ thống, không chỉ tạo một dashboard đơn lẻ.

Ưu tiên thiết kế các màn hình MVP theo thứ tự:

### Must-have — ưu tiên cao nhất
1. Login.
2. HR Dashboard.
3. Danh sách kỳ đánh giá.
4. Wizard tạo/cấu hình kỳ.
5. Chi tiết kỳ và tiến độ.
6. Employee Dashboard.
7. Employee Self-review.
8. Manager Dashboard.
9. Manager Review Detail.
10. Calibration Dashboard.
11. Calibration Employee Detail / Edit Score.
12. Bonus Allocation Center.
13. Director Approval.
14. Published Employee Result.
15. Import Preview & Validation.
16. Reports / Export.
17. Role-based navigation.
18. Audit Log.

### Nên có
- Notification center.
- AI insight detail.
- AI Bonus simulation.
- System configuration.

## 30. Tiêu chuẩn chất lượng đầu ra

- Các màn hình phải dùng chung design system.
- Có navigation và luồng chuyển trang thực tế.
- Các nút chính có trạng thái và hành động hợp lý; không tạo nút trang trí.
- Có mock data thực tế, không dùng Lorem Ipsum.
- Dùng tiếng Việt tự nhiên, đúng thuật ngữ nghiệp vụ.
- Bảng, chart và KPI phải thống nhất số liệu.
- Có đủ trạng thái empty/loading/error/disabled/success cho các luồng quan trọng.
- Mỗi role chỉ nhìn thấy đúng dữ liệu và chức năng.
- Mọi thao tác nhạy cảm có confirm dialog và/hoặc lý do bắt buộc.
- Công thức và trạng thái phải khớp BRD.
- AI không được thể hiện như người có quyền quyết định.
- Không tự bổ sung nghiệp vụ ngoài BRD nếu chưa đánh dấu là đề xuất.

**Hãy bắt đầu bằng việc tạo một design system và application shell, sau đó triển khai các màn hình MVP theo thứ tự ưu tiên. Đảm bảo sản phẩm trông như một SaaS HR chuyên nghiệp có thể demo với ban giám đốc và người dùng doanh nghiệp.**

---

# PHẦN I — STYLE GUIDE THAM KHẢO

## 31. Hướng thiết kế khuyến nghị

### Primary direction: Modern Enterprise SaaS

- Light theme.
- Sidebar navy/white hoặc nền trắng với active state xanh.
- Main background xám rất nhạt.
- White cards, border mảnh, shadow nhẹ.
- Bảng dữ liệu rõ ràng, row height thoáng.
- Chart đơn giản, màu có ý nghĩa.
- Status badge tinh tế.
- Typography Inter.
- Border radius 10–14px.
- Không dùng glassmorphism quá nhiều.
- Không dùng gradient làm nền toàn trang.
- Tránh dashboard quá nhiều card nhỏ gây nhiễu.

### Secondary direction: Employee Experience

Ở khu vực nhân viên:
- Ít menu.
- Ít số liệu phức tạp.
- Tiến độ đánh giá rõ.
- Ngôn ngữ tích cực, hướng dẫn cụ thể.
- Form theo từng nhóm tiêu chí.
- Kết quả cá nhân trình bày trực quan, có giải thích.

### AI visual treatment

- Dùng violet nhẹ cho AI insight.
- Luôn có nhãn “AI gợi ý”.
- Có phần “Vì sao có cảnh báo này?”.
- Có nguồn dữ liệu/căn cứ.
- Tách biệt “Kết quả tính toán chính thức” và “Mô phỏng AI”.
- Không dùng icon/visual khiến người dùng hiểu AI đang tự duyệt hoặc tự chia tiền.

## 32. Những điều không nên làm

- Không thiết kế toàn bộ ứng dụng như một landing page.
- Không dùng một dashboard chung cho cả 5 role.
- Không cho nhân viên xem dữ liệu người khác.
- Không hiển thị cảnh báo AI là kết luận thiên vị.
- Không để AI tự quyết định điểm hoặc tiền thưởng.
- Không cho HR chỉnh điểm ngoài Calibration.
- Không cho sửa dữ liệu kỳ sau khi Approved nếu chưa mở lại.
- Không bỏ qua audit log.
- Không nhập file mà không có bước preview/validation.
- Không hiển thị điểm tổng thiếu 2 chữ số thập phân.
- Không để tổng thưởng vượt quỹ sau làm tròn.
- Không tự coi tiêu chí không áp dụng là 0 điểm.
- Không tự bổ sung quy tắc cho các câu hỏi mở của BRD.

---

# PHẦN J — CÁC ĐIỂM BRD CÒN CHỜ BUSINESS XÁC NHẬN

Các nội dung sau được BRD nêu là câu hỏi mở/đề xuất. Không tự coi là quyết định đã chốt trong UI:

1. Quy mô doanh nghiệp và cấu trúc phòng ban nhiều cấp.
2. Có mở rộng đánh giá 360 hay không (MVP hiện chỉ tự đánh giá + quản lý).
3. Hệ số thâm niên và các mốc 1 năm/3 năm.
4. Quỹ thưởng phân bổ toàn công ty hay theo phòng ban trước.
5. Có quy trình duyệt nhiều cấp hay không (MVP đề xuất HR đề xuất, Giám đốc duyệt).
6. Tiêu chí riêng của hội đồng về AI/bảo mật.
7. Quy tắc làm tròn 1.000 VNĐ và phân phối phần dư.
8. Ngưỡng điều chỉnh điểm cần Giám đốc xác nhận (đề xuất đổi hạng hoặc lệch quá 1.0).
9. Định nghĩa vi phạm kỷ luật nghiêm trọng và người xác nhận.
10. Khi quản lý quá hạn: HR chấm thay hay gán lại quản lý; mốc quá hạn.
11. Phần quỹ không dùng hết được giữ lại hay chia lại.
12. KPI công việc do quản lý chấm hay quy đổi từ KPI import; nếu quy đổi thì theo bảng nào.
13. Cách cấu hình tiêu chí không áp dụng theo chức danh.
14. Hệ số thâm niên có giới hạn trần không.
15. Nhân viên nghỉ việc/chuyển phòng ban giữa kỳ có được thưởng và tính tỷ lệ thế nào.
16. Quy tắc làm tròn điểm tổng: BRD phần quy tắc đề xuất làm tròn thông thường; câu hỏi mở vẫn yêu cầu Business xác nhận.

Nếu cần thể hiện các nội dung này trên giao diện, dùng label “Đề xuất — chờ xác nhận”, “Chưa cấu hình” hoặc “Cần Business xác nhận”; không tự đặt giá trị mặc định mang tính chính sách.

---

# PHẦN K — PROMPT NGẮN ĐỂ TẠO TỪNG MÀN HÌNH

Có thể dùng các prompt dưới đây sau khi AI tool đã tạo design system và application shell.

## 33. Prompt — HR Dashboard

Thiết kế HR Dashboard cho AI-Assisted Performance & Bonus Hub theo Modern Enterprise SaaS, light theme. Hiển thị KPI tổng nhân viên, tỷ lệ hoàn thành tự đánh giá, tỷ lệ quản lý đánh giá, trường hợp quá hạn, cảnh báo AI chưa xử lý, quỹ thưởng dự kiến. Có workflow kỳ đánh giá 6 trạng thái, biểu đồ phân bổ S/A/B/C theo phòng ban, danh sách việc cần xử lý, hoạt động gần đây và quick actions. Dùng dữ liệu demo nhất quán, tiếng Việt, ưu tiên hierarchy rõ và khả năng scan nhanh.

## 34. Prompt — Employee Self-review

Thiết kế màn hình tự đánh giá cho nhân viên. Trải nghiệm đơn giản, thân thiện, responsive mobile-first. Hiển thị tên kỳ, deadline, progress, nhóm tiêu chí và tiêu chí con với mô tả, trọng số, input điểm theo thang cấu hình và textarea ghi chú. Có lưu nháp, preview, submit và confirm. Nhân viên chỉ xem dữ liệu của chính mình; không hiển thị điểm quản lý hoặc kết quả thưởng trước khi công bố. Có trạng thái đã nộp và “Không tự đánh giá” khi quá hạn.

## 35. Prompt — Manager Review

Thiết kế màn hình quản lý chấm điểm nhân viên cấp dưới. Bố cục gồm danh sách nhân viên cần chấm và trang detail. Từng tiêu chí hiển thị điểm tự đánh giá để tham chiếu, input điểm quản lý, nhận xét, trọng số và chênh lệch. Bắt buộc nhận xét khi điểm ≥9 hoặc ≤4. Có AI insight panel với nhãn “Tín hiệu cần rà soát”, nguồn căn cứ, mức Bất thường/Nghiêm trọng và hành động xử lý. Không cho quản lý chấm chính mình hoặc người ngoài phạm vi quản lý.

## 36. Prompt — Calibration Center

Thiết kế Calibration Center cho HR như một workspace chuyên nghiệp. Có KPI tiến độ, bảng so sánh điểm tự đánh giá/điểm quản lý/điểm tổng, xếp hạng, cảnh báo AI và thưởng dự kiến. Có filter theo phòng ban, quản lý, xếp hạng, mức cảnh báo. Detail cho phép HR điều chỉnh điểm với điểm cũ/mới, lý do bắt buộc, người sửa, thời gian và ảnh hưởng đến xếp hạng/thưởng. Cảnh báo đổi hạng hoặc lệch quá 1.0 điểm cần Giám đốc xác nhận. Giữ audit trail và không cho AI tự quyết định.

## 37. Prompt — Bonus Allocation Center

Thiết kế màn hình phân bổ quỹ thưởng. Hiển thị tổng quỹ, tổng thưởng theo công thức, quỹ còn lại, số nhân viên đủ điều kiện và bị loại. Bảng có điểm, hạng, hệ số hạng, thâm niên, hệ số thâm niên, trọng số phân bổ, tiền trước/sau làm tròn và lý do loại. Có khu vực giải thích công thức chính thức, phần dư làm tròn và kiểm tra không vượt quỹ. AI panel chỉ giải thích và mô phỏng, không thay đổi số tiền chính thức. Nếu tổng trọng số phân bổ bằng 0, hiển thị lỗi và giữ nguyên quỹ.

## 38. Prompt — Director Approval

Thiết kế trang phê duyệt dành cho Giám đốc. Hiển thị tóm tắt kỳ, phân bổ S/A/B/C, tổng quỹ, tổng thưởng, cảnh báo AI, điều chỉnh điểm cần xác nhận và audit log. Có checklist điều kiện duyệt, nút Phê duyệt và Từ chối. Từ chối bắt buộc nhập lý do và chuyển kỳ về Calibration. Giao diện nhấn mạnh khả năng kiểm tra căn cứ và tính minh bạch, không có hành động AI tự duyệt.

## 39. Prompt — Import Preview

Thiết kế quy trình import CSV/Excel gồm upload, preview, validation và confirm. Hiển thị tổng số dòng, hợp lệ, lỗi, trùng. Highlight cell lỗi; cung cấp số dòng, cột, giá trị và lý do. Dòng trùng mã nhân viên + kỳ bị từ chối; dòng thiếu trường hoặc sai định dạng bị bỏ qua. Chỉ nhập dòng hợp lệ sau khi HR xác nhận.

## 40. Prompt — Employee Published Result

Thiết kế trang kết quả đánh giá cá nhân sau công bố. Hiển thị điểm tổng 2 chữ số, xếp hạng S/A/B/C, điểm theo nhóm, giải thích cách tính và lịch sử điểm qua các kỳ. Có nhận xét/thành tích được phép công bố và thưởng được duyệt nếu chính sách hiển thị đã xác nhận. Trình bày dễ hiểu, tích cực, không hiển thị dữ liệu nhân viên khác.

---

**Kết thúc prompt.**
