package ct01.n06.backend.dto.qrcode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScanTotpRequest {
    @NotNull(message = "Thiếu eventId")
    private Long eventId;

    @NotBlank(message = "Thiếu mã TOTP")
    @Pattern(regexp = "\\d{6}", message = "Mã TOTP phải gồm 6 chữ số")
    private String totp;
}

