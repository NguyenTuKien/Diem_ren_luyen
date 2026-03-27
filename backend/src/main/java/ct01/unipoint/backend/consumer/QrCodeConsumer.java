package ct01.unipoint.backend.consumer;

import ct01.unipoint.backend.config.RabbitMQConfig;
import ct01.unipoint.backend.dao.AttendenceDao;
import ct01.unipoint.backend.dao.EventDao;
import ct01.unipoint.backend.dao.StudentDao;
import ct01.unipoint.backend.dto.qrcode.QrCheckinMessage;
import ct01.unipoint.backend.entity.AttendenceEntity;
import ct01.unipoint.backend.entity.EventEntity;
import ct01.unipoint.backend.entity.StudentEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class QrCodeConsumer {

    private final AttendenceDao attendenceDao;
    private final EventDao eventDao;
    private final StudentDao studentDao;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    public void processQrCheckin(QrCheckinMessage message) {
        try {
            Long eventId = message.getEventId();
            String studentId = message.getStudentId();
            
            // Re-validate against potential duplicate check-ins in the queue
            if (attendenceDao.findByEventIdAndStudentId(eventId, studentId).isPresent()) {
                log.info("Sinh viên {} đã điểm danh cho sự kiện {}. Bỏ qua message trùng lặp.", studentId, eventId);
                return;
            }

            EventEntity event = eventDao.findById(eventId).orElse(null);
            StudentEntity student = studentDao.findById(studentId).orElse(null);

            if (event != null && student != null) {
                AttendenceEntity attendence = AttendenceEntity.builder()
                        .event(event)
                        .student(student)
                        .createdAt(LocalDateTime.now())
                        .build();

                attendenceDao.save(attendence);
                log.info("Lưu điểm danh thành công cho sinh viên {} tại event {}", studentId, eventId);
            } else {
                log.warn("Lỗi điểm danh: Sinh viên hoặc Sự kiện không tồn tại. studentId={}, eventId={}", studentId, eventId);
            }
        } catch (Exception e) {
            log.error("Có lỗi trong quá trình xử lý QR checkin queue", e);
        }
    }
}
