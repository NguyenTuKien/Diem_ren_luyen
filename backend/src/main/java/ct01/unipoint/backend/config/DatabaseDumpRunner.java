package ct01.unipoint.backend.config;

import ct01.unipoint.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DatabaseDumpRunner implements CommandLineRunner {

  private final SemesterRepository semesterRepository;
  private final ClassRepository classRepository;
  private final StudentRepository studentRepository;
  private final UserRepository userRepository;
  private final CriteriaRepository criteriaRepository;
  private final EventRepository eventRepository;
  private final RecordRepository recordRepository;
  private final StudentSemesterRepository evaluationDao;

  public DatabaseDumpRunner(SemesterRepository semesterRepository, ClassRepository classRepository, StudentRepository studentRepository, UserRepository userRepository, CriteriaRepository criteriaRepository, EventRepository eventRepository, RecordRepository recordRepository, StudentSemesterRepository evaluationDao) {
    this.semesterRepository = semesterRepository;
    this.classRepository = classRepository;
    this.studentRepository = studentRepository;
    this.userRepository = userRepository;
    this.criteriaRepository = criteriaRepository;
    this.eventRepository = eventRepository;
    this.recordRepository = recordRepository;
    this.evaluationDao = evaluationDao;
  }

  @Override
  @Transactional(readOnly = true)
  public void run(String... args) {
    System.out.println("\n==========================================================================================");
    System.out.println("HIỂN THỊ TOÀN BỘ DỮ LIỆU CHI TIẾT TRONG DATABASE");
    System.out.println("==========================================================================================\n");

    System.out.println("--- 1. BẢNG USERS (Tài khoản) ---");
    userRepository.findAll().forEach(u ->
        System.out.println("User[id=" + u.getId() + ", username='" + u.getUsername() + "', role='" + u.getRole() + "', status='" + u.getStatus() + "']")
    );

    System.out.println("\n--- 2. BẢNG STUDENTS (Sinh viên) ---");
    studentRepository.findAll().forEach(s -> {
      String userId = s.getUserEntity() != null ? s.getUserEntity().getId() : null;
      Long classId = s.getClassEntity() != null ? s.getClassEntity().getId() : null;
      System.out.println("Student[id=" + s.getId() + ", code='" + s.getStudentCode() + "', name='" + s.getFullName() + "', FK_userId=" + userId + ", FK_classId=" + classId + "]");
    });

    System.out.println("\n--- 3. BẢNG SEMESTERS (Học kỳ) ---");
    semesterRepository.findAll().forEach(s ->
        System.out.println("Semester[id=" + s.getId() + ", name='" + s.getName() + "', isActive=" + s.getIsActive() + "]")
    );

    System.out.println("\n--- 4. BẢNG CRITERIAS (Tiêu chí rèn luyện) ---");
    criteriaRepository.findAll().forEach(c ->
        System.out.println("Criteria[id=" + c.getId() + ", code='" + c.getCode() + "', maxPoint=" + c.getMaxPoint() + "]")
    );

    System.out.println("\n--- 5. BẢNG EVENTS (Sự kiện) ---");
    eventRepository.findAll().forEach(e -> {
      Long semId = e.getSemester() != null ? e.getSemester().getId() : null;
      Long critId = e.getCriteria() != null ? e.getCriteria().getId() : null;
      System.out.println("Event[id=" + e.getId() + ", title='" + e.getTitle() + "', FK_semId=" + semId + ", FK_critId=" + critId + "]");
    });

    System.out.println("\n--- 6. BẢNG ACTIVITY_RECORDS (Điểm tự động đã cộng) ---");
    recordRepository.findAll().forEach(r -> {
      String stuId = r.getStudent() != null ? r.getStudent().getId() : null;
      Long semId = r.getSemester() != null ? r.getSemester().getId() : null;
      Long eventId = r.getEvent() != null ? r.getEvent().getId() : null;
      Long critId = r.getCriteria() != null ? r.getCriteria().getId() : null;
      System.out.println("Record[id=" + r.getId() + ", status='" + r.getStatus() + "', FK_studentId=" + stuId + ", FK_semId=" + semId + ", FK_eventId=" + eventId + ", FK_critId=" + critId + "]");
    });

    System.out.println("\n--- 7. BẢNG SEMESTER_EVALUATIONS (Phiếu điểm rèn luyện) ---");
    evaluationDao.findAll().forEach(ev -> {
      String stuId = ev.getStudent() != null ? ev.getStudent().getId() : null;
      Long semId = ev.getSemester() != null ? ev.getSemester().getId() : null;
      System.out.println("Evaluation[id=" + ev.getId() + ", status='" + ev.getStatus() + "', finalScore=" + ev.getFinalScore() + ", FK_studentId=" + stuId + ", FK_semId=" + semId + "]");
    });

    System.out.println("\n==========================================================================================");
    System.out.println("KẾT THÚC QUÉT DỮ LIỆU");
    System.out.println("==========================================================================================\n");
  }
}