---
name: Một số thống nhất chung cho Backend
description: Tiêu chuẩn lập trình và kiến trúc thư mục Backend Spring Boot thực tế đóng gói bằng Facade, Dao, Constants
---

# Một số thống nhất cho Backend

Tài liệu này dựa trên cấu trúc source code hiện tại tại `backend/src/main/java/ct01/unipoint/backend` của dự án UniPoint. 

## 1. Công Nghệ Sự Dụng (Tech Stack)
- **Java**: Java 21+
- **Framework Chính**: Spring Boot 3.x
- **Database**: PostgreSQL/MySQL thông qua Spring Data JPA
- **Message Broker**: RabbitMQ (Consumer pattern)
- **Security**: JWT Authentication + Spring Security

## 2. Sơ Đồ Cây Thư Mục (Folder Tree)
Dưới đây là cây thư mục thực tế đang triển khai trong code để mọi người dễ hình dung, các bạn code tính năng mới bắt buộc phải tuân theo luồng này:

```text
src/main/java/ct01/unipoint/backend/
├── config/           # Chứa các file cấu hình Bean cơ bản (Security, Redis, WebMvc)
├── constant/         # CHÚ Ý: Nơi chứa toàn bộ Hằng Số của dự án (VD: EventConstant.java, UserConstant.java)
├── consumer/         # Các listener nhận message từ RabbitMQ/Kafka (VD: QrCodeConsumer.java)
├── controller/       # Rest Api endpoints (*Controller.java). Gọi xuống Facade hoặc Service.
    ├── admin         # Các API dành riêng cho Admin
    ├── lecturer      # Các API dành riêng cho Giảng Viên
    ├── monitor       # Các API dành riêng cho Lớp Trưởng
    └── student       # Các API dành riêng cho Sinh Viên
    ...               # Các API không yêu cầu phân quyền (AuthController, ...)
├── dao/              # Các interface truy suất Repo (Hậu tố *Dao.java)
├── dto/              # Các class DTO (Data Transfer Object) dùng để nhận request và trả response. Chia theo domain (EventDto, UserDto,...)
├── entity/           # Bảng DB Model (Hậu tố *Entity.java)
│   ├── base/         # Chứa BaseEntity (id, createdAt, updatedAt)
│   └── enums/        # Các Enum dùng trong DB
├── exception/        # Ném lỗi với ApiException.java và hứng bằng RestExceptionHandler.java
├── facade/           # CHÚ Ý: Bộ điều phối gom logic chéo của nhiều Service (VD: AuthFacade.java)
├── security/         # Provider và Filter cho cấu trúc JWT
└── service/          # Các class Core Logic (Hậu tố *Service.java). Không tách rời Interface và Impl.
    ├── impl          # Nếu có logic phức tạp cần tách riêng, nhưng ưu tiên viết trực tiếp trong Service nếu đơn giản.
    ...               # Interface Service (VD: AuthService.java)
```

## 3. Kiến Trúc Lõi Bắt Buộc Tuân Thủ

### 3.1. Thứ tự trong MVC project

- Controller có thể chứa nhiều Service, Service có thể gọi nhiều Dao, Dao có thể gọi nhiều Entity.
- **Quy tắc**: Không được gọi trực tiếp Entity hoặc Dao từ Controller, phải thông qua Service hoặc Facade.

### 3.2. Facade Pattern (Bộ Điều Phối)
- Khác với MVC truyền thống, dự án UniPoint sử dụng tầng **Facade** (`facade/`) để điều phối các service. 
- **Quy tắc**: Nếu logic Controller gọi từ 2 Service trở lên và có tính phức tạp, **phải** tạo 1 Facade (Ví dụ `AuthFacade`) đóng gói logic đó lại. Tầng Service chỉ tập trung đúng nghiệp vụ của chính Entity đó.

### 3.2. Không Tách Giao Diện (No Interface in Service)
- Các file trong thư mục `service/` (`EventService`, `UserService`...) được định nghĩa dưới dạng **Class trực tiếp** thực thi logic thay vì mô hình `Service` (Interface) đi kèm `ServiceImpl` (Class) rườm rà.

### 3.3. Dao & Entity Suffixes
- Các file Data Access Object giao tiếp CSDL nằm trong `dao/` và luôn kết thúc bằng đuôi `*Dao` (`EventDao`, `UserDao`). 
- **Luệt lệ**: Không được đặt tên file DAO có dạng Repository.
- Tương tự, Entity ánh xạ xuống Table phải kết thúc bằng `*Entity` (`EventEntity`).

### 3.4. Quản Lý Lỗi Toàn Cục (Global Exception)
- Mọi lỗi Logic/Nghiệp vụ (VD: Sai mật khẩu, User không tồn tại) phải ném thông qua `ApiException` nằm ở tầng `exception/`.
- File `RestExceptionHandler.java` (gắn `@ControllerAdvice`) sẽ tự động hứng toàn bộ ngoại lệ và trả ra format JSON chuẩn hoá cho Client. Đừng dùng `try-catch` cục bộ trả về ResponseEntity ở mọi ngóc ngách controller.

### 3.5. Biến Toàn Cục (Constant Classes)
- **Cấm** code hardcode String tĩnh (ví dụ báo lỗi: `"User not found"`) ngay trong code Service.
- Tất cả text báo lỗi, text cấu hình, biến số chung được định nghĩa dưới dạng *hằng số tĩnh* ở thư mục `constant/` với đuôi `*Constant` (Ví dụ `UserConstant.MESSAGE_USER_NOT_FOUND`).

### 3.6. Dependency Injection & Mapping:

- Dependency Injection: Tuyệt đối không sử dụng `@Autowired` trên field. Bắt buộc dùng Constructor Injection thông qua `@RequiredArgsConstructor` của thư viện Lombok.

- Boilerplate: Tận dụng tối đa Lombok (`@Getter`, `@Setter`, `@Builder`, `@Slf4j`) thay vì tự sinh code thủ công.

- Mapping Data: Sử dụng MapStruct để map giữa Entity và DTO (không tự viết các hàm chuyển đổi thủ công) HOẶC sử dụng `@Builder` để map thủ công trong file Facade/Service.

## 4. Flow Viết Tiêu Chuẩn 1 Tính Năng
1. Tạo Database Table tương ứng -> Code `XxxEntity.java` trong `entity/`.
2. Tạo interface truy xuất DB -> `XxxDao.java` trong `dao/`.
3. Tạo thông báo lỗi tĩnh -> `XxxConstant.java` trong `constant/`.
4. Viết Core Logic thao tác 1 bảng -> `XxxService.java` trong `service/`.
5. Tạo `RequestDto` và `ResponseDto` trong nhánh domain tương ứng của `dto/`.
6. Tích hợp từ 2 Service trở lên tạo luồng kinh doanh (Business flow) -> `XxxFacade.java`.
7. Viết Endpoint gọi Facade/Service tương ứng trả về Client -> `XxxController.java`.
