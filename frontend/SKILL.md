---
name: Một số thống nhất chung cho Frontend
description: Tiêu chuẩn lập trình và kiến trúc thư mục Frontend React thực tế thiết kế theo mô hình Feature-Sliced (Role-based)
---

# Một số thống nhất chung cho Frontend

Tài liệu này dựa trên cấu trúc source code hiện tại tại `frontend/src` của dự án UniPoint. 
Dự án không dùng mô hình tách cấu trúc theo Type (tất cả Components vào 1 folder, tất cả Hooks vào 1 folder) lỗi thời, mà sử dụng tư duy phân quyền **Role-based (Feature-sliced)** tối tân và an toàn hơn.

## 1. Công Nghệ Sử Dụng (Tech Stack)
- **Library**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios (bọc bởi Custom Fetch/HTTP class)
- **Linting**: ESLint v9

## 2. Sơ Đồ Cây Thư Mục Lõi (Folder Tree)
Dưới đây là cấu trúc chính diện hiện tại mà bất cứ ai cũng phải tuân thủ:

```text
src/
├── api/              # Chứa toàn bộ các HTTP Fetcher trực tiếp đến Backend (*Api.js)
├── app/              # Chứa các Config/Setup bao bọc ở Root level của App (ví dụ Redux store nếu có)
├── assets/           # Media tĩnh (images, fonts...)
├── components/       # Các UI Component cơ bản (Basic UI Component: Button, Input) KHÔNG mang Business Logic
├── config/           # Các Utils Config chung cho toàn project
├── context/          # Khai báo React Context (VD: AuthContext để giữ phiên đăng nhập)
├── data/             # Mock data tĩnh
├── features/         # 🔥 CHÚ Ý: NƠI CHỨA CỐT LÕI LOGIC. CHIA THEO DOMAIN ROLE: 
│   ├── admin/        # Components/Luồng riêng chỉ Admin xài
│   ├── auth/         # Components cho trang Login/Register
│   ├── lecturer/     # Components riêng của Giảng Viên
│   ├── monitor/      # Components riêng của Lớp Trưởng
│   └── student/      # Components riêng của Sinh Viên
├── pages/            # Nơi lắp ráp các Layouts và Component từ features/ để biến thành Route Page nguyên khối
├── shared/           
│   ├── api/          # API dùng chung chéo quyền
│   └── components/   # Các Component giao diện mang Business Logic xài xuyên suốt 2,3 Roles...
└── styles/           # CSS tổng thể hoặc Tailwind base
```

## 3. Kiến Trúc Lõi Bắt Buộc Tuân Thủ

### 3.1. Feature-Sliced Role-based Isolation (Cô lập theo Quyền)
- Do hệ thống phân tầng rất nhiều Role phức tạp, **không được** vứt hết các Form hay Component nghiệp vụ vào chung 1 file hoặc thư mục `components/` chung.
- Nếu bạn code Form dành riêng cho Lớp trưởng, BẮT BUỘC đặt nó tại: `src/features/monitor/`. Không để chung với Sinh viên. Điều này bảo vệ code không bao giờ conflict giữa Frontend 1 (Sinh Viên) và Frontend 2 (Giảng Viên).

### 3.2. Không Fetch Data Trực Tiếp Trên Giao Diện (API Rule)
- Tuyệt đối không xài `axios.get` hoặc `fetch` trần trũi chèn cứng trong `useEffect()` ở bất cứ file UI Component nào. 
- Mọi lệnh gọi API Backend phải được khai báo dạng Endpoint Helper bên trong `src/api/` hoặc `src/shared/api/`. 
- **Quy tắc đặt tên API File**: Phải kết thúc bằng chữ `*Api.js` (Ví dụ: `authApi.js`, `qrcodeApi.js`, `eventApi.js`).

### 3.3. Sử Dụng Shared Thông Minh
- Nếu một Component có mang theo logic (Ví dụ: Table hiển thị điểm chung chung) mà cả `lecturer` và `monitor` cùng xài, hãy vứt nó vào `src/shared/components/`.
- Nếu Component chỉ là UI thuần túy vô tri giác (chỉ truyền Text vào và hiển thị ra), thả vào `src/components/`.

### 3.4. Cấu Trúc Pages vs Features
- Tránh việc nhồi nhét xử lý Button, Text logic dài dằng dặc trong `src/pages/`.
- File trong `pages/` chỉ nên dùng để `import` các Block từ `features/` vào tạo thành bức tranh hoàn chỉnh bọc bằng React Router.

### 3.5. Quản Lý Trạng Thái (State) & Móc Câu (Hooks)
- **Cấm lạm dụng `useEffect`:** Tuyệt đối không viết một nùi logic tính toán, gọi API lồng nhau, set state liên tục bên trong `useEffect`. 
- **Tách Hook:** Mọi logic lấy dữ liệu (fetching) hoặc xử lý form phức tạp CẦN phải được tách ra thành Custom Hook (Ví dụ: `useStudentData.js`) đặt cùng cấp thư mục với Component đó trong `features/`.

### 3.6. Quy Chuẩn Styling (CSS/UI)
- Sử dụng class CSS tĩnh hoặc Tailwind CSS (nếu dự án có setup) để style.
- **Tuyệt đối không viết inline style** (ví dụ: `style={{ marginTop: '10px' }}`) trực tiếp vào thẻ HTML trừ khi đó là giá trị động (dynamic value) tính toán bằng JS.
- Tận dụng tối đa các component đã có sẵn trong `src/components/` trước khi tự chế ra một UI mới.

### 3.7. Định Dạng File (File Extensions)
- Các file chứa UI Component (có return ra JSX) bắt buộc phải lưu dưới đuôi **`.jsx`**.
- Các file chỉ chứa logic (như API, Config, Utils, Constants, Custom Hooks) thì lưu dưới đuôi **`.js`**.

## 4. Flow Viết Tiêu Chuẩn 1 Tính Năng Lớn Của 1 Role Mới
1. Xác định UI này dành cho Role nào -> Tạo thư mục con tương ứng trong `features/` (ví dụ `features/student/StudentScore/`).
2. Nếu có tạo Call API mới -> Chạy ra `api/` viết endpoint vào `XxxApi.js`.
3. Tách logic xử lý data vào một file Custom Hook (nếu cần).
4. Nhúng Endpoint/Hook vào Component ở `features/`. Component tự handle Loading/Error.
5. Lắp Component mảng lớn đó vào 1 Page trống tại thư mục `pages/`.
6. Đăng ký Page đó vào mảng Routing.