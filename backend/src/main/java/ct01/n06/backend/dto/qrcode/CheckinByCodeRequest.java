package ct01.n06.backend.dto.qrcode;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckinByCodeRequest {

    @NotBlank(message = "Thiếu mã PIN")
    @Size(min = 6, max = 6, message = "Mã PIN phải gồm 6 ký tự")
    @Pattern(regexp = "\\d{6}", message = "Mã PIN chỉ gồm 6 chữ số")
    private String pinCode;
}

