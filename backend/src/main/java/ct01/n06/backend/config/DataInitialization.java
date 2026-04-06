package ct01.n06.backend.config;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import ct01.n06.backend.entity.ClassEntity;
import ct01.n06.backend.entity.CriteriaEntity;
import ct01.n06.backend.entity.EventEntity;
import ct01.n06.backend.entity.FacultyEntity;
import ct01.n06.backend.entity.LecturerEntity;
import ct01.n06.backend.entity.SemesterEntity;
import ct01.n06.backend.entity.StudentEntity;
import ct01.n06.backend.entity.UserEntity;
import ct01.n06.backend.entity.enums.Role;
import ct01.n06.backend.entity.enums.UserStatus;
import ct01.n06.backend.repository.ClassRepository;
import ct01.n06.backend.repository.CriteriaRepository;
import ct01.n06.backend.repository.EventRepository;
import ct01.n06.backend.repository.FacultyRepository;
import ct01.n06.backend.repository.LecturerRepository;
import ct01.n06.backend.repository.SemesterRepository;
import ct01.n06.backend.repository.StudentRepository;
import ct01.n06.backend.repository.UserRepository;

@Configuration
public class DataInitialization {

  @Bean
  @Order(1)
  @Transactional
  CommandLineRunner initFaculty(FacultyRepository facultyRepository) {
    return args -> {
      List<FacultyEntity> faculties = List.of(
          FacultyEntity.builder().code("CNTT").name("Công nghệ thông tin").build(),
          FacultyEntity.builder().code("CB").name("Cơ bản").build(),
          FacultyEntity.builder().code("QTKD").name("Quản trị kinh doanh").build()
      );

      for (FacultyEntity faculty : faculties) {
        if (facultyRepository.findByCode(faculty.getCode()).isEmpty()) {
          facultyRepository.save(faculty);
        }
      }
    };
  }

  @Bean
  @Order(2)
  @Transactional
  CommandLineRunner initAdmin(
      UserRepository userRepository,
      LecturerRepository lecturerRepository,
      FacultyRepository facultyRepository,
      PasswordEncoder passwordEncoder
  ) {
    return args -> {
      FacultyEntity faculty = facultyRepository.findByCode("CNTT").orElseThrow();

      UserEntity adminUser = userRepository.findByUsernameIgnoreCase("admin")
          .orElseGet(() -> userRepository.save(UserEntity.builder()
              .username("admin")
              .email("admin@ptit.edu.vn")
              .password(passwordEncoder.encode("Admin@123"))
              .role(Role.ROLE_ADMIN)
              .status(UserStatus.ACTIVE)
              .build()));

      if (lecturerRepository.findByUserEntityId(adminUser.getId()).isEmpty()) {
        lecturerRepository.save(LecturerEntity.builder()
            .userEntity(adminUser)
            .lecturerCode("ADMIN")
          .fullName("Quản trị viên")
            .facultyEntity(faculty)
            .build());
      }
    };
  }

  @Bean
  @Order(3)
  @Transactional
  CommandLineRunner initStudent(
      StudentRepository studentRepository,
      UserRepository userRepository,
      FacultyRepository facultyRepository,
      LecturerRepository lecturerRepository,
      ClassRepository classRepository,
      PasswordEncoder passwordEncoder
  ) {
    return args -> {
      FacultyEntity faculty = facultyRepository.findByCode("CNTT").orElseThrow();

      UserEntity lecturerUser = userRepository.findByEmailIgnoreCase("ct01.n06@ptit.edu.vn")
          .orElseGet(() -> userRepository.save(UserEntity.builder()
              .username("ct01.n06")
              .email("ct01.n06@ptit.edu.vn")
              .password(passwordEncoder.encode("Lecturer@123"))
              .role(Role.ROLE_LECTURER)
              .status(UserStatus.ACTIVE)
              .build()));

      LecturerEntity lecturer = lecturerRepository.findByUserEntity_EmailIgnoreCase("ct01.n06@ptit.edu.vn")
          .orElseGet(() -> lecturerRepository.save(LecturerEntity.builder()
              .userEntity(lecturerUser)
              .lecturerCode("Lec001")
              .fullName("Mr.Kien Toan Tu")
              .facultyEntity(faculty)
              .build()));

      ClassEntity classEntity = classRepository.findByClassCodeIgnoreCase("d23ctcn01-b")
          .orElseGet(() -> classRepository.save(ClassEntity.builder()
              .classCode("D23CTCN01-B")
              .facultyEntity(faculty)
              .lecturerEntity(lecturer)
              .build()));

      if (classEntity.getLecturerEntity() == null
          || !classEntity.getLecturerEntity().getId().equals(lecturer.getId())) {
        classEntity.setLecturerEntity(lecturer);
        classRepository.save(classEntity);
      }

      List<StudentSeed> students = List.of(
          new StudentSeed("B23CN465", "kiennt.b23cn465", "kiennt.b23cn465@stu.ptit.edu.vn", "Kien NT"),
          new StudentSeed("B23CN832", "toannm.b23cn832", "toannm.b23cn832@stu.ptit.edu.vn", "Toan NM"),
          new StudentSeed("B23CN873", "tunb.b23cn873", "tunb.b23cn873@stu.ptit.edu.vn", "Tu NB")
      );

      for (StudentSeed seed : students) {
        String normalizedEmail = seed.email().toLowerCase(Locale.ROOT);

        UserEntity studentUser = userRepository.findByEmailIgnoreCase(normalizedEmail)
            .orElseGet(() -> userRepository.save(UserEntity.builder()
                .username(seed.username())
                .email(normalizedEmail)
                .password(passwordEncoder.encode("Student@123"))
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .build()));

        Optional<StudentEntity> existingStudent = studentRepository.findByStudentCodeIgnoreCase(
            seed.studentCode());

        if (existingStudent.isPresent()) {
          StudentEntity student = existingStudent.get();
          student.setUserEntity(studentUser);
          student.setFullName(seed.fullName());
          student.setClassEntity(classEntity);
          studentRepository.save(student);
          continue;
        }

        studentRepository.save(StudentEntity.builder()
            .userEntity(studentUser)
            .studentCode(seed.studentCode())
            .fullName(seed.fullName())
            .classEntity(classEntity)
            .build());
      }
    };
  }

  private record StudentSeed(String studentCode, String username, String email, String fullName) {
  }

  @Bean
  @Order(4)
  @Transactional
  CommandLineRunner initLecturer(
      LecturerRepository lecturerRepository,
      UserRepository userRepository,
      FacultyRepository facultyRepository,
      PasswordEncoder passwordEncoder
  ) {
    return args -> {
      if (lecturerRepository.findByUserEntity_EmailIgnoreCase("agv.gv001@ptit.edu.vn").isPresent()) {
        return;
      }

      UserEntity userEntity = userRepository.findByEmailIgnoreCase("agv.gv001@ptit.edu.vn")
          .orElseGet(() -> userRepository.save(UserEntity.builder()
              .username("gv001")
              .email("agv.gv001@ptit.edu.vn")
              .password(passwordEncoder.encode("GV001@123"))
              .role(Role.ROLE_LECTURER)
              .status(UserStatus.ACTIVE)
              .build()));

      lecturerRepository.save(LecturerEntity.builder()
          .userEntity(userEntity)
          .lecturerCode("GV001")
          .fullName("Giảng viên A")
          .facultyEntity(facultyRepository.findByCode("CNTT").orElseThrow())
          .build());
    };
  }

  @Bean
  @Order(5)
  @Transactional
  CommandLineRunner initSemester(SemesterRepository semesterRepository) {
    return args -> {
      List<SemesterEntity> semesters = List.of(
          SemesterEntity.builder()
              .name("HK1-2026")
              .startDate(LocalDate.of(2026, 1, 6))
              .endDate(LocalDate.of(2026, 5, 31))
              .isActive(true)
              .build(),
          SemesterEntity.builder()
              .name("HK2-2026")
              .startDate(LocalDate.of(2026, 8, 15))
              .endDate(LocalDate.of(2026, 12, 31))
              .isActive(false)
              .build(),
          SemesterEntity.builder()
              .name("HK1-2027")
              .startDate(LocalDate.of(2027, 1, 5))
              .endDate(LocalDate.of(2027, 5, 30))
              .isActive(false)
              .build()
      );

      for (SemesterEntity semester : semesters) {
        if (semesterRepository.findByName(semester.getName()).isEmpty()) {
          semesterRepository.save(semester);
        }
      }
    };
  }

  @Bean
  @Order(6)
  @Transactional
  CommandLineRunner initCriteria(CriteriaRepository criteriaRepository) {
    return args -> {
      List<CriteriaEntity> criteriaList = List.of(
          CriteriaEntity.builder()
              .code("HD01")
              .name("Tham gia hoạt động ngoại khóa")
              .pointPerItem(BigDecimal.valueOf(2.0))
              .maxPoint(BigDecimal.valueOf(20.0))
              .requireEvidence(true)
              .build(),
          CriteriaEntity.builder()
              .code("NCKH")
              .name("Nghiên cứu khoa học")
              .pointPerItem(BigDecimal.valueOf(5.0))
              .maxPoint(BigDecimal.valueOf(10.0))
              .requireEvidence(true)
              .build(),
          CriteriaEntity.builder()
              .code("SV5T")
              .name("Sinh viên 5 tốt")
              .pointPerItem(BigDecimal.valueOf(10.0))
              .maxPoint(BigDecimal.valueOf(10.0))
              .requireEvidence(true)
              .build(),
          CriteriaEntity.builder()
              .code("CTXH")
              .name("Công tác xã hội")
              .pointPerItem(BigDecimal.valueOf(2.0))
              .maxPoint(BigDecimal.valueOf(10.0))
              .requireEvidence(false)
              .build()
      );

      for (CriteriaEntity criteria : criteriaList) {
        if (criteriaRepository.findByCode(criteria.getCode()).isEmpty()) {
          criteriaRepository.save(criteria);
        }
      }
    };
  }

  @Bean
  @Order(7)
  @Transactional
  CommandLineRunner initEvent(
      EventRepository eventRepository,
      SemesterRepository semesterRepository,
      CriteriaRepository criteriaRepository,
      UserRepository userRepository
  ) {
    return args -> {
      if (eventRepository.count() > 0) {
        return;
      }

      Optional<SemesterEntity> semesterOptional = semesterRepository.findByName("HK1-2026");
      Optional<CriteriaEntity> criteriaOptional = criteriaRepository.findByCode("HD01");
      Optional<UserEntity> createdByOptional = userRepository.findByUsernameIgnoreCase("admin");

      if (semesterOptional.isEmpty() || criteriaOptional.isEmpty() || createdByOptional.isEmpty()) {
        return;
      }

      SemesterEntity semester = semesterOptional.get();
      CriteriaEntity criteria = criteriaOptional.get();
      UserEntity createdBy = createdByOptional.get();

      List<EventEntity> events = List.of(
          EventEntity.builder()
              .semester(semester)
              .criteria(criteria)
            .title("Hội thảo AI trong giáo dục")
              .organizer("Khoa CNTT")
            .description("Chia sẻ ứng dụng AI trong giảng dạy và học tập")
            .location("Hội trường A1")
              .startTime(LocalDateTime.of(2026, 4, 10, 8, 0))
              .endTime(LocalDateTime.of(2026, 4, 10, 11, 30))
              .createdBy(createdBy)
              .build(),
          EventEntity.builder()
              .semester(semester)
              .criteria(criteria)
            .title("Ngày hội hiến máu sinh viên")
            .organizer("Đoàn Thanh niên")
            .description("Hoạt động tình nguyện hiến máu nhân đạo dành cho sinh viên")
            .location("Nhà thi đấu")
              .startTime(LocalDateTime.of(2026, 4, 18, 7, 30))
              .endTime(LocalDateTime.of(2026, 4, 18, 11, 0))
              .createdBy(createdBy)
              .build(),
          EventEntity.builder()
              .semester(semester)
              .criteria(criteria)
            .title("Cuộc thi ý tưởng khởi nghiệp")
            .organizer("CLB Khởi nghiệp")
            .description("Sinh viên trình bày ý tưởng startup và nhận góp ý từ giảng viên")
              .location("Phòng B302")
              .startTime(LocalDateTime.of(2026, 5, 5, 13, 30))
              .endTime(LocalDateTime.of(2026, 5, 5, 17, 0))
              .createdBy(createdBy)
              .build()
      );

      List<EventEntity> eventsToInsert = events.stream()
          .filter(event -> eventRepository.findByTitleAndStartTime(event.getTitle(), event.getStartTime())
              .isEmpty())
          .toList();

      if (!eventsToInsert.isEmpty()) {
        eventRepository.saveAll(eventsToInsert);
      }
    };
  }
}