package ct01.unipoint.backend.consumer;

import ct01.unipoint.backend.config.RabbitMQConfig;
import ct01.unipoint.backend.repository.AttendenceRepository;
import ct01.unipoint.backend.repository.EventRepository;
import ct01.unipoint.backend.repository.StudentRepository;
import ct01.unipoint.backend.dto.qrcode.QrCheckinMessage;
import ct01.unipoint.backend.entity.AttendenceEntity;
import ct01.unipoint.backend.entity.EventEntity;
import ct01.unipoint.backend.entity.StudentEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class QrCodeConsumer {

    private final AttendenceRepository attendenceRepository;
    private final EventRepository eventRepository;
    private final StudentRepository studentRepository;
    private final StringRedisTemplate stringRedisTemplate;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    public void processQrCheckin(QrCheckinMessage message) {

        Long eventId = message.getEventId();
        String studentId = message.getStudentId();

        String lockKey = "checkin_lock:" + studentId + ":" + eventId;
        String lockValue = UUID.randomUUID().toString();

        log.info("Nhận message check-in: studentId={}, eventId={}", studentId, eventId);

        // 🔒 Acquire distributed lock (SET NX + TTL)
        Boolean lockAcquired = stringRedisTemplate.opsForValue()
                .setIfAbsent(lockKey, lockValue, Duration.ofSeconds(10));

        if (Boolean.FALSE.equals(lockAcquired)) {
            log.warn("Duplicate event bị chặn bởi Redis lock: studentId={}, eventId={}", studentId, eventId);
            return;
        }

        try {
            // ⚡ Check DB nhanh (idempotency)
            boolean existed = attendenceRepository.existsByEventIdAndStudentId(eventId, studentId);
            if (existed) {
                log.warn("Đã tồn tại check-in trong DB: studentId={}, eventId={}", studentId, eventId);
                return;
            }

            // 🔎 Lấy dữ liệu
            EventEntity event = eventRepository.findById(eventId).orElse(null);
            StudentEntity student = studentRepository.findById(studentId).orElse(null);

            if (event == null || student == null) {
                log.error("Không tìm thấy dữ liệu: studentId={}, eventId={}", studentId, eventId);
                return;
            }

            // 💾 Save DB
            AttendenceEntity attendence = AttendenceEntity.builder()
                    .event(event)
                    .student(student)
                    .createdAt(LocalDateTime.now())
                    .build();

            attendenceRepository.save(attendence);

            log.info("Check-in thành công: studentId={}, eventId={}", studentId, eventId);

        } catch (Exception e) {
            log.error("Lỗi xử lý check-in queue", e);

        } finally {
            // 🔓 Release lock an toàn (check value)
            try {
                String currentValue = stringRedisTemplate.opsForValue().get(lockKey);
                if (lockValue.equals(currentValue)) {
                    stringRedisTemplate.delete(lockKey);
                    log.info("Đã release Redis lock: {}", lockKey);
                }
            } catch (Exception e) {
                log.error("Lỗi khi release Redis lock", e);
            }
        }
    }
}