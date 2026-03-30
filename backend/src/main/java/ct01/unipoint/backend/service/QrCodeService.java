package ct01.unipoint.backend.service;

import ct01.unipoint.backend.dao.AttendenceDao;
import ct01.unipoint.backend.dao.EventDao;
import ct01.unipoint.backend.dao.QrCodeDao;
import ct01.unipoint.backend.dao.StudentDao;
import ct01.unipoint.backend.dto.request.ScanQrRequest;
import ct01.unipoint.backend.dto.response.GenerateQrResponse;
import ct01.unipoint.backend.config.RabbitMQConfig;
import ct01.unipoint.backend.dto.qrcode.QrCheckinMessage;
import ct01.unipoint.backend.entity.AttendenceEntity;
import ct01.unipoint.backend.entity.EventEntity;
import ct01.unipoint.backend.entity.QrCodeEntity;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QrCodeService {

    private final QrCodeDao qrCodeDao;
    private final EventDao eventDao;
    private final StudentDao studentDao;
    private final AttendenceDao attendenceDao;
    private final RabbitTemplate rabbitTemplate;

    public GenerateQrResponse generateQr(Long eventId) {
        String token = UUID.randomUUID().toString();
        
        QrCodeEntity qrcode = QrCodeEntity.builder()
                .qrToken(token)
                .eventId(eventId)
                .timeToLive(6L) // 6 giây trên Redis (để buffer 1s cho mạng)
                .build();
                
        // Lưu vào Redis, cấu hình @TimeToLive sẽ tự động xóa sau TTL
        qrCodeDao.save(qrcode);
        
        return GenerateQrResponse.builder()
                .qrToken(token)
                .timeToLive(5L) // Báo với frontend là 5s
                .build();
    }

    @Transactional
    public void scanQr(ScanQrRequest request, String studentUserId) {
        String token = request.getQrData();
        if (token == null || token.trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mã QR không hợp lệ");
        }

        QrCodeEntity qrCode = qrCodeDao.findById(token)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Mã QR đã hết hạn hoặc không hợp lệ"));

        Optional<AttendenceEntity> existing = attendenceDao.findByEventIdAndStudentId(qrCode.getEventId(), studentUserId);
        if (existing.isPresent()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Bạn đã điểm danh sự kiện này rồi!");
        }

        EventEntity event = eventDao.findById(qrCode.getEventId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy sự kiện"));

        StudentEntity student = studentDao.findById(studentUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Tài khoản của bạn chưa được liên kết với hồ sơ sinh viên"));

        QrCheckinMessage message = QrCheckinMessage.builder()
                .eventId(event.getId())
                .studentId(student.getId())
                .build();

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY, message);
    }
}
