package ct01.n06.backend.dto.qrcode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrCheckinMessage implements Serializable {
    private Long eventId;
    private String studentId;
}
