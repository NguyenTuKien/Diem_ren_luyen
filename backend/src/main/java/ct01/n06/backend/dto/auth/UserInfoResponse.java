package ct01.n06.backend.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoResponse {
    private String userId;
    private String fullName;
    private String role;
    private String profileCode; // MSSV (student), mã GV (lecturer), username (admin)
}

