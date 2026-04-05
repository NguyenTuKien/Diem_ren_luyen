package ct01.n06.backend.service.impl;

import ct01.n06.backend.repository.AttendenceRepository;
import ct01.n06.backend.repository.EventRepository;
import ct01.n06.backend.repository.QrCodeRepository;
import ct01.n06.backend.repository.StudentRepository;
import ct01.n06.backend.service.QrCodeService;
import ct01.n06.backend.dto.qrcode.CheckinByCodeRequest;
import ct01.n06.backend.dto.qrcode.ScanQrRequest;
import ct01.n06.backend.dto.qrcode.GenerateQrResponse;
import ct01.n06.backend.config.RabbitMQConfig;
import ct01.n06.backend.dto.qrcode.QrCheckinMessage;
import ct01.n06.backend.entity.AttendenceEntity;
import ct01.n06.backend.entity.EventEntity;
import ct01.n06.backend.entity.QrCodeEntity;
import ct01.n06.backend.entity.StudentEntity;
import ct01.n06.backend.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static ct01.n06.backend.util.RandomUtil.generate6DigitPin;

@Service
@RequiredArgsConstructor
public class QrCodeServiceImpl implements QrCodeService {

    private static final String PIN_CODE_KEY_PREFIX = "PIN_";
    private static final long PIN_CODE_TTL_SECONDS = 11L;

    private final QrCodeRepository qrCodeRepository;
    private final EventRepository eventRepository;
    private final StudentRepository studentRepository;
    private final AttendenceRepository attendenceRepository;
    private final RabbitTemplate rabbitTemplate;
    private final StringRedisTemplate stringRedisTemplate;

    @Override
    public GenerateQrResponse generateQr(Long eventId) {
        String token = UUID.randomUUID().toString();
        String pinCode = generateUniquePinCode(eventId);
        QrCodeEntity qrcode = QrCodeEntity.builder()
                .qrToken(token)
                .eventId(eventId)
                .pinCode(pinCode)
                .timeToLive(PIN_CODE_TTL_SECONDS) // 11 giây trên Redis (để buffer 1s cho mạng)
                .build();
                
        // Lưu vào Redis, cấu hình @TimeToLive sẽ tự động xóa sau TTL
        qrCodeRepository.save(qrcode);
        
        return GenerateQrResponse.builder()
                .qrToken(token)
                .pinCode(pinCode)
                .timeToLive(5L) // Báo với frontend là 5s
                .build();
    }

    @Override
    @Transactional
    public void scanQr(ScanQrRequest request, String studentUserId, String deviceId) {
        String token = request.getQrData();
        if (token == null || token.trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mã QR không hợp lệ");
        }
        if (request.getEventId() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Thiếu eventId");
        }
        if (deviceId == null || deviceId.trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Thiếu deviceId");
        }

        String normalizedDeviceId = deviceId.trim();

        QrCodeEntity qrCode = qrCodeRepository.findById(token)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Mã QR đã hết hạn hoặc không hợp lệ"));

        if (!request.getEventId().equals(qrCode.getEventId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "eventId không khớp với mã QR");
        }
        performCheckin(qrCode.getEventId(), studentUserId, normalizedDeviceId);
    }

    @Override
    @Transactional
    public void checkinByCode(CheckinByCodeRequest request, String studentUserId, String deviceId) {
        if (request.getPinCode() == null || request.getPinCode().trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Thiếu mã PIN");
        }
        if (deviceId == null || deviceId.trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Thiếu deviceId");
        }

        String normalizedPin = request.getPinCode().trim();
        String normalizedDeviceId = deviceId.trim();

        String pinKey = buildPinKey(normalizedPin);
        String eventIdValue = stringRedisTemplate.opsForValue().get(pinKey);
        if (eventIdValue == null || eventIdValue.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mã PIN không tồn tại hoặc đã hết hạn");
        }

        Long eventId;
        try {
            eventId = Long.valueOf(eventIdValue.trim());
        } catch (NumberFormatException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mã PIN không tồn tại hoặc đã hết hạn");
        }

        performCheckin(eventId, studentUserId, normalizedDeviceId);
    }

    private void performCheckin(Long eventId, String studentUserId, String deviceId) {
        StudentEntity student = studentRepository.findByUserEntityId(studentUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Tài khoản của bạn chưa được liên kết với hồ sơ sinh viên"));

        EventEntity event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy sự kiện"));

        LocalDateTime now = LocalDateTime.now();
        Duration ttlDuration = Duration.between(now, event.getEndTime());
        if (!ttlDuration.isPositive()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Sự kiện đã kết thúc, không thể điểm danh");
        }

        Optional<AttendenceEntity> existing = attendenceRepository.findByEventIdAndStudentId(eventId, student.getId());
        if (existing.isPresent()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Bạn đã điểm danh sự kiện này rồi!");
        }

        String finalDeviceLockKey = "event_checkin:" + event.getId() + ":device:" + deviceId;
        Boolean finalLockAcquired = stringRedisTemplate.opsForValue()
                .setIfAbsent(finalDeviceLockKey, student.getId(), ttlDuration);
        if (!Boolean.TRUE.equals(finalLockAcquired)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Thiết bị này đã được sử dụng để điểm danh");
        }

        QrCheckinMessage message = QrCheckinMessage.builder()
                .eventId(event.getId())
                .studentId(student.getId())
                .deviceId(deviceId)
                .build();

        try {
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY, message);
        } catch (Exception ex) {
            String currentValue = stringRedisTemplate.opsForValue().get(finalDeviceLockKey);
            if (student.getId().equals(currentValue)) {
                stringRedisTemplate.delete(finalDeviceLockKey);
            }
            throw ex;
        }
    }

    private String generateUniquePinCode(Long eventId) {
        while (true) {
            String pinCode = generate6DigitPin();
            String pinKey = buildPinKey(pinCode);
            Boolean registered = stringRedisTemplate.opsForValue()
                    .setIfAbsent(pinKey, String.valueOf(eventId), Duration.ofSeconds(PIN_CODE_TTL_SECONDS));
            if (Boolean.TRUE.equals(registered)) {
                return pinCode;
            }
        }
    }

    private String buildPinKey(String pinCode) {
        return PIN_CODE_KEY_PREFIX + pinCode;
    }
}


