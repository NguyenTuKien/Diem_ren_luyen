# Backend API

Tài liệu này liệt kê các API hiện có trong backend của hệ thống `Diem_ren_luyen`.

## Tổng quan

- Base URL: `/v1`
- Xác thực: JWT Bearer token (trừ các endpoint public).
- Phân quyền: kết hợp `SecurityConfig` (URL-based) và `@PreAuthorize` (method-level).
- Định dạng response: tùy controller, có endpoint trả `ResponseGeneral<T>`, `Page<T>`, DTO, hoặc `void`.

## Quy ước cột

- `Input`: Query params, path params, body.
- `Output`: Kiểu dữ liệu response chính.
- `Xác thực`: `Không` hoặc `Bearer`.
- `Phân quyền`: role thực tế theo cấu hình hiện tại.

## Danh sách API

### 1) Auth

| Method | Path | Input | Output | Xác thực | Phân quyền | Mô tả |
| --- | --- | --- | --- | --- | --- | --- |
| `POST` | `/v1/auth/login` | Body: `LoginRequest` | `LoginResponse` (`accessToken`, `refreshToken`) | Không | Public | Đăng nhập. |
| `POST` | `/v1/auth/refresh` | Body: `{ refreshToken: string }` | `LoginResponse` | Không | Public | Làm mới token. |
| `POST` | `/v1/auth/logout` | Header: `Authorization` (optional), Body (optional): `{ refreshToken }` | `204 No Content` | Bearer (khuyến nghị) | User đã đăng nhập | Đăng xuất và thu hồi token. |
| `GET` | `/v1/auth/me` | Không | `UserInfoResponse` | Bearer | User đã đăng nhập | Lấy thông tin user hiện tại. |

### 2) Lớp học

| Method | Path | Input | Output | Xác thực | Phân quyền | Mô tả |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/v1/classes` | Không | `ResponseGeneral<List<ClassResponse>>` | Bearer | User đã đăng nhập | Lấy danh sách lớp. |

### 3) Tiêu chí rèn luyện

| Method | Path | Input | Output | Xác thực | Phân quyền | Mô tả |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/v1/criterias` | Không | `List<CriteriaEntity>` | Bearer | User đã đăng nhập | Lấy danh sách tiêu chí. |

### 4) Học kỳ

| Method | Path | Input | Output | Xác thực | Phân quyền | Mô tả |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/v1/semesters` | Không | `List<SemesterEntity>` | Bearer | User đã đăng nhập | Lấy danh sách học kỳ. |

### 5) Sự kiện

| Method | Path | Input | Output | Xác thực | Phân quyền | Mô tả |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/v1/events` | Query: `page` (default 0), `size` (default 10) | `Page<EventResponse>` | Bearer | User đã đăng nhập | Lấy danh sách sự kiện có phân trang. |

### 6) QR Code

| Method | Path | Input | Output | Xác thực | Phân quyền | Mô tả |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/v1/qrcode/generate` | Query: `eventId` | `GenerateQrResponse` | Bearer | `ROLE_LECTURER` hoặc `ROLE_ADMIN` (`@PreAuthorize`) | Tạo QR cho sự kiện. |
| `POST` | `/v1/qrcode/scan` | Body: `ScanQrRequest` | `Map<String,Object>` (`success`, `message`) | Bearer | `ROLE_STUDENT` (`@PreAuthorize`) | Sinh viên quét QR để điểm danh. |
| `POST` | `/v1/qrcode/checkin/code` | Header: `X-Device-Id`; Body: `CheckinByCodeRequest` (`pinCode`) | `Map<String,Object>` (`success`, `message`) | Bearer | `ROLE_STUDENT` (`@PreAuthorize`) | Sinh viên nhập mã PIN để điểm danh. |

### 7) Student

| Method | Path | Input | Output | Xác thực | Phân quyền | Mô tả |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/v1/student/dashboard` | Không | `StudentDashboardResponse` | Bearer | User đã đăng nhập (module Student) | Lấy dashboard sinh viên hiện tại. |

### 8) Student Evaluations

| Method | Path | Input | Output | Xác thực | Phân quyền | Mô tả |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/v1/student/evaluations/form` | Query: `semesterId` | `ResponseGeneral<EvaluationFormResponse>` | Bearer | User đã đăng nhập (module Student) | Lấy form tự đánh giá theo học kỳ. |
| `POST` | `/v1/student/evaluations/submit` | Body: `StudentSubmitRequest` (`semesterId`, `details`, `isDraft`) | `ResponseGeneral<Void>` | Bearer | User đã đăng nhập (module Student) | Gửi phiếu tự đánh giá. |

### 9) Monitor

| Method | Path | Input | Output | Xác thực | Phân quyền | Mô tả |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/v1/monitor/class-members` | Không | `MonitorClassListResponse` | Bearer | `ROLE_MONITOR` (SecurityConfig `/v1/monitor/**`) | Lấy danh sách thành viên lớp do lớp trưởng quản lý. |

### 10) Monitor Evaluations

| Method | Path | Input | Output | Xác thực | Phân quyền | Mô tả |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/v1/monitor/evaluations/class-list` | Query: `semesterId` | `ResponseGeneral<List<StudentEvaluationSummaryResponse>>` | Bearer | `ROLE_MONITOR` | Lấy danh sách phiếu của lớp theo học kỳ. |
| `GET` | `/v1/monitor/evaluations/{evaluationId}` | Path: `evaluationId` | `ResponseGeneral<EvaluationFormResponse>` | Bearer | `ROLE_MONITOR` | Lấy chi tiết phiếu đánh giá. |
| `POST` | `/v1/monitor/evaluations/review` | Body: `MonitorReviewRequest` (`evaluationId`, `adjustedDetails`) | `ResponseGeneral<Void>` | Bearer | `ROLE_MONITOR` | Chấm/duyệt phiếu ở cấp lớp trưởng. |

### 11) Lecturer Students

| Method | Path | Input | Output | Xác thực | Phân quyền | Mô tả |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/v1/lecturer/students/options` | Query: `lecturerId` | `LecturerStudentOptionsResponse` | Bearer | `ROLE_LECTURER` (SecurityConfig `/v1/lecturer/**`) | Lấy dữ liệu option lọc. |
| `GET` | `/v1/lecturer/students` | Query: `lecturerId`, `facultyId?`, `classId?`, `status?`, `keyword?` | `LecturerStudentListResponse` | Bearer | `ROLE_LECTURER` | Lấy danh sách sinh viên theo bộ lọc. |
| `POST` | `/v1/lecturer/students/manual` | Query: `lecturerId`; Body: `ManualCreateStudentRequest` | `LecturerStudentRowResponse` | Bearer | `ROLE_LECTURER` | Tạo sinh viên thủ công. |
| `POST` | `/v1/lecturer/students/import` | Query: `lecturerId`; Multipart: `file` | `ImportStudentsResponse` | Bearer | `ROLE_LECTURER` | Import sinh viên từ Excel. |
| `PUT` | `/v1/lecturer/students/{studentId}/monitor` | Query: `lecturerId`; Path: `studentId` | `LecturerStudentRowResponse` | Bearer | `ROLE_LECTURER` | Gán sinh viên làm monitor. |
| `PUT` | `/v1/lecturer/students/{studentId}/status` | Query: `lecturerId`; Path: `studentId`; Body: `UpdateStudentStatusRequest` | `LecturerStudentRowResponse` | Bearer | `ROLE_LECTURER` | Cập nhật trạng thái sinh viên. |
| `DELETE` | `/v1/lecturer/students/{studentId}` | Query: `lecturerId`; Path: `studentId` | `SimpleMessageResponse` | Bearer | `ROLE_LECTURER` | Xóa sinh viên. |

### 12) Lecturer Events

| Method | Path | Input | Output | Xác thực | Phân quyền | Mô tả |
| --- | --- | --- | --- | --- | --- | --- |
| `POST` | `/v1/lecturer/events` | Body: `EventRequest` | `EventResponse` | Bearer | `ROLE_LECTURER` | Tạo sự kiện. |
| `PUT` | `/v1/lecturer/events/{id}` | Path: `id`; Body: `EventRequest` | `EventResponse` | Bearer | `ROLE_LECTURER` | Cập nhật sự kiện. |
| `DELETE` | `/v1/lecturer/events/{id}` | Path: `id` | `void` (`200/204`) | Bearer | `ROLE_LECTURER` | Xóa sự kiện. |

### 13) Lecturer Evaluations

| Method | Path | Input | Output | Xác thực | Phân quyền | Mô tả |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/v1/lecturer/evaluations/class-list` | Query: `classId`, `semesterId` | `ResponseGeneral<List<StudentEvaluationSummaryResponse>>` | Bearer | `ROLE_LECTURER` | Lấy danh sách phiếu theo lớp + học kỳ. |
| `GET` | `/v1/lecturer/evaluations/{evaluationId}` | Path: `evaluationId` | `ResponseGeneral<EvaluationFormResponse>` | Bearer | `ROLE_LECTURER` | Lấy chi tiết phiếu. |
| `POST` | `/v1/lecturer/evaluations/review` | Body: `LecturerReviewRequest` (`evaluationId`, `adjustedDetails`) | `ResponseGeneral<Void>` | Bearer | `ROLE_LECTURER` | Duyệt/chấm ở cấp giảng viên. |
| `POST` | `/v1/lecturer/evaluations/finalize` | Query: `classId`, `semesterId` | `ResponseGeneral<Void>` | Bearer | `ROLE_LECTURER` | Chốt điểm cả lớp theo học kỳ. |

## Ghi chú phân quyền quan trọng

- Theo `SecurityConfig`, các URL `/v1/lecturer/**` yêu cầu `ROLE_LECTURER`, `/v1/monitor/**` yêu cầu `ROLE_MONITOR`, `/v1/admin/**` yêu cầu `ROLE_ADMIN`.
- Các URL còn lại mặc định yêu cầu đăng nhập (`anyRequest().authenticated()`), trừ các endpoint public đã `permitAll` như `/v1/auth/login`, `/v1/auth/refresh`.
- Riêng `QR Code` dùng phân quyền ở mức method (`@PreAuthorize`), nên `generate` cho `LECTURER|ADMIN`, `scan` cho `STUDENT`.
