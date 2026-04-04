package ct01.unipoint.backend.config;

import ct01.unipoint.backend.dao.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DatabaseDumpRunner implements CommandLineRunner {

  private final SemesterDao semesterDao;
  private final ClassDao classDao;
  private final StudentDao studentDao;
  private final UserDao userDao;
  private final CriteriaDao criteriaDao;
  private final EventDao eventDao;
  private final RecordDao recordDao;
  private final StudentSemesterDao evaluationDao;

  public DatabaseDumpRunner(SemesterDao semesterDao, ClassDao classDao, StudentDao studentDao, UserDao userDao, CriteriaDao criteriaDao, EventDao eventDao, RecordDao recordDao, StudentSemesterDao evaluationDao) {
    this.semesterDao = semesterDao;
    this.classDao = classDao;
    this.studentDao = studentDao;
    this.userDao = userDao;
    this.criteriaDao = criteriaDao;
    this.eventDao = eventDao;
    this.recordDao = recordDao;
    this.evaluationDao = evaluationDao;
  }

  @Override
  @Transactional(readOnly = true)
  public void run(String... args) {
    System.out.println("\n==========================================================================================");
    System.out.println("HIỂN THỊ TOÀN BỘ DỮ LIỆU CHI TIẾT TRONG DATABASE");
    System.out.println("==========================================================================================\n");

    System.out.println("--- 1. BẢNG USERS (Tài khoản) ---");
    userDao.findAll().forEach(u ->
        System.out.println("User[id=" + u.getId() + ", username='" + u.getUsername() + "', role='" + u.getRole() + "', status='" + u.getStatus() + "']")
    );

    System.out.println("\n--- 2. BẢNG STUDENTS (Sinh viên) ---");
    studentDao.findAll().forEach(s -> {
      String userId = s.getUserEntity() != null ? s.getUserEntity().getId() : null;
      Long classId = s.getClassEntity() != null ? s.getClassEntity().getId() : null;
      System.out.println("Student[id=" + s.getId() + ", code='" + s.getStudentCode() + "', name='" + s.getFullName() + "', FK_userId=" + userId + ", FK_classId=" + classId + "]");
    });

    System.out.println("\n--- 3. BẢNG SEMESTERS (Học kỳ) ---");
    semesterDao.findAll().forEach(s ->
        System.out.println("Semester[id=" + s.getId() + ", name='" + s.getName() + "', isActive=" + s.getIsActive() + "]")
    );

    System.out.println("\n--- 4. BẢNG CRITERIAS (Tiêu chí rèn luyện) ---");
    criteriaDao.findAll().forEach(c ->
        System.out.println("Criteria[id=" + c.getId() + ", code='" + c.getCode() + "', maxPoint=" + c.getMaxPoint() + "]")
    );

    System.out.println("\n--- 5. BẢNG EVENTS (Sự kiện) ---");
    eventDao.findAll().forEach(e -> {
      Long semId = e.getSemester() != null ? e.getSemester().getId() : null;
      Long critId = e.getCriteria() != null ? e.getCriteria().getId() : null;
      System.out.println("Event[id=" + e.getId() + ", title='" + e.getTitle() + "', FK_semId=" + semId + ", FK_critId=" + critId + "]");
    });

    System.out.println("\n--- 6. BẢNG ACTIVITY_RECORDS (Điểm tự động đã cộng) ---");
    recordDao.findAll().forEach(r -> {
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