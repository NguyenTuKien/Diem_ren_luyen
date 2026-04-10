package ct01.n06.backend.dto.qrcode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScanQrRequest {
    private String qrData;
    private Long eventId;
    private String blueToothId;
    private String deviceId;
}
