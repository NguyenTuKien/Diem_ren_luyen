package ct01.unipoint.backend.config;

import ct01.unipoint.backend.dao.ClassDao;
import ct01.unipoint.backend.dao.CriteriaDao;
import ct01.unipoint.backend.dao.EventDao;
import ct01.unipoint.backend.dao.FacultyDao;
import ct01.unipoint.backend.dao.LecturerDao;
import ct01.unipoint.backend.dao.SemesterDao;
import ct01.unipoint.backend.dao.StudentDao;
import ct01.unipoint.backend.dao.UserDao;
import ct01.unipoint.backend.entity.ClassEntity;
import ct01.unipoint.backend.entity.CriteriaEntity;
import ct01.unipoint.backend.entity.EventEntity;
import ct01.unipoint.backend.entity.FacultyEntity;
import ct01.unipoint.backend.entity.LecturerEntity;
import ct01.unipoint.backend.entity.SemesterEntity;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.entity.enums.Role;
import ct01.unipoint.backend.entity.enums.UserStatus;
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

@Configuration
public class DataInitialization {

  @Bean
  @Order(1)
  @Transactional
  CommandLineRunner initFaculty(FacultyDao facultyDao) {
    return args -> {
      List<FacultyEntity> faculties = List.of(
          FacultyEntity.builder().code("CNTT").name("Cong nghe thong tin").build(),
          FacultyEntity.builder().code("CB").name("Co ban").build(),
          FacultyEntity.builder().code("QTKD").name("Quan tri kinh doanh").build()
      );

      for (FacultyEntity faculty : faculties) {
        if (facultyDao.findByCode(faculty.getCode()).isEmpty()) {
          facultyDao.save(faculty);
        }
      }
    };
  }

  @Bean
  @Order(2)
  @Transactional
  CommandLineRunner initAdmin(
      UserDao userDao,
      LecturerDao lecturerDao,
      FacultyDao facultyDao,
      PasswordEncoder passwordEncoder
  ) {
    return args -> {
      FacultyEntity faculty = facultyDao.findByCode("CNTT").orElseThrow();

      UserEntity adminUser = userDao.findByUsernameIgnoreCase("admin")
          .orElseGet(() -> userDao.save(UserEntity.builder()
              .username("admin")
              .email("admin@ptit.edu.vn")
              .password(passwordEncoder.encode("Admin@123"))
              .role(Role.ROLE_ADMIN)
              .status(UserStatus.ACTIVE)
              .build()));

      if (lecturerDao.findByUserEntityId(adminUser.getId()).isEmpty()) {
        lecturerDao.save(LecturerEntity.builder()
            .userEntity(adminUser)
            .lecturerCode("ADMIN")
            .fullName("Quan tri vien")
            .facultyEntity(faculty)
            .build());
      }
    };
  }

  @Bean
  @Order(3)
  @Transactional
  CommandLineRunner initStudent(
      StudentDao studentDao,
      UserDao userDao,
      FacultyDao facultyDao,
      LecturerDao lecturerDao,
      ClassDao classDao,
      PasswordEncoder passwordEncoder
  ) {
    return args -> {
      FacultyEntity faculty = facultyDao.findByCode("CNTT").orElseThrow();

      UserEntity lecturerUser = userDao.findByEmailIgnoreCase("longdh@ptit.edu.vn")
          .orElseGet(() -> userDao.save(UserEntity.builder()
              .username("ct01.n06")
              .email("ct01.n06@ptit.edu.vn")
              .password(passwordEncoder.encode("Lecturer@123"))
              .role(Role.ROLE_LECTURER)
              .status(UserStatus.ACTIVE)
              .build()));

      LecturerEntity lecturer = lecturerDao.findByUserEntity_EmailIgnoreCase("ct01.n06@ptit.edu.vn")
          .orElseGet(() -> lecturerDao.save(LecturerEntity.builder()
              .userEntity(lecturerUser)
              .lecturerCode("Lec001")
              .fullName("Mr.Kien Toan Tu")
              .facultyEntity(faculty)
              .build()));

      ClassEntity classEntity = classDao.findByClassCodeIgnoreCase("d23ctcn01-b")
          .orElseGet(() -> classDao.save(ClassEntity.builder()
              .classCode("D23CTCN01-B")
              .facultyEntity(faculty)
              .lecturerEntity(lecturer)
              .build()));

      if (classEntity.getLecturerEntity() == null
          || !classEntity.getLecturerEntity().getId().equals(lecturer.getId())) {
        classEntity.setLecturerEntity(lecturer);
        classDao.save(classEntity);
      }

      List<StudentSeed> students = List.of(
          new StudentSeed("B23CN465", "kiennt.b23cn465", "kiennt.b23cn465@stu.ptit.edu.vn", "Kien NT"),
          new StudentSeed("B23CN832", "toannm.b23cn832", "toannm.b23cn832@stu.ptit.edu.vn", "Toan NM"),
          new StudentSeed("B23CN873", "tunb.b23cn873", "tunb.b23cn873@stu.ptit.edu.vn", "Tu NB")
      );

      for (StudentSeed seed : students) {
        String normalizedEmail = seed.email().toLowerCase(Locale.ROOT);

        UserEntity studentUser = userDao.findByEmailIgnoreCase(normalizedEmail)
            .orElseGet(() -> userDao.save(UserEntity.builder()
                .username(seed.username())
                .email(normalizedEmail)
                .password(passwordEncoder.encode("Student@123"))
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .build()));

        Optional<StudentEntity> existingStudent = studentDao.findByStudentCodeIgnoreCase(
            seed.studentCode());

        if (existingStudent.isPresent()) {
          StudentEntity student = existingStudent.get();
          student.setUserEntity(studentUser);
          student.setFullName(seed.fullName());
          student.setClassEntity(classEntity);
          studentDao.save(student);
          continue;
        }

        studentDao.save(StudentEntity.builder()
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
      LecturerDao lecturerDao,
      UserDao userDao,
      FacultyDao facultyDao,
      PasswordEncoder passwordEncoder
  ) {
    return args -> {
      if (lecturerDao.findByUserEntity_EmailIgnoreCase("agv.gv001@ptit.edu.vn").isPresent()) {
        return;
      }

      UserEntity userEntity = userDao.findByEmailIgnoreCase("agv.gv001@ptit.edu.vn")
          .orElseGet(() -> userDao.save(UserEntity.builder()
              .username("gv001")
              .email("agv.gv001@ptit.edu.vn")
              .password(passwordEncoder.encode("GV001@123"))
              .role(Role.ROLE_LECTURER)
              .status(UserStatus.ACTIVE)
              .build()));

      lecturerDao.save(LecturerEntity.builder()
          .userEntity(userEntity)
          .lecturerCode("GV001")
          .fullName("Giang vien A")
          .facultyEntity(facultyDao.findByCode("CNTT").orElseThrow())
          .build());
    };
  }

  @Bean
  @Order(5)
  @Transactional
  CommandLineRunner initSemester(SemesterDao semesterDao) {
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
        if (semesterDao.findByName(semester.getName()).isEmpty()) {
          semesterDao.save(semester);
        }
      }
    };
  }

  @Bean
  @Order(6)
  @Transactional
  CommandLineRunner initCriteria(CriteriaDao criteriaDao) {
    return args -> {
      List<CriteriaEntity> criteriaList = List.of(
          CriteriaEntity.builder()
              .code("HD01")
              .name("Tham gia hoat dong ngoai khoa")
              .pointPerItem(BigDecimal.valueOf(2.0))
              .maxPoint(BigDecimal.valueOf(20.0))
              .requireEvidence(true)
              .build(),
          CriteriaEntity.builder()
              .code("NCKH")
              .name("Nghien cuu khoa hoc")
              .pointPerItem(BigDecimal.valueOf(5.0))
              .maxPoint(BigDecimal.valueOf(10.0))
              .requireEvidence(true)
              .build(),
          CriteriaEntity.builder()
              .code("SV5T")
              .name("Sinh vien 5 tot")
              .pointPerItem(BigDecimal.valueOf(10.0))
              .maxPoint(BigDecimal.valueOf(10.0))
              .requireEvidence(true)
              .build(),
          CriteriaEntity.builder()
              .code("CTXH")
              .name("Cong tac xa hoi")
              .pointPerItem(BigDecimal.valueOf(2.0))
              .maxPoint(BigDecimal.valueOf(10.0))
              .requireEvidence(false)
              .build()
      );

      for (CriteriaEntity criteria : criteriaList) {
        if (criteriaDao.findByCode(criteria.getCode()).isEmpty()) {
          criteriaDao.save(criteria);
        }
      }
    };
  }

  @Bean
  @Order(7)
  @Transactional
  CommandLineRunner initEvent(
      EventDao eventDao,
      SemesterDao semesterDao,
      CriteriaDao criteriaDao,
      UserDao userDao
  ) {
    return args -> {
      if (eventDao.count() > 0) {
        return;
      }

      Optional<SemesterEntity> semesterOptional = semesterDao.findByName("HK1-2026");
      Optional<CriteriaEntity> criteriaOptional = criteriaDao.findByCode("HD01");
      Optional<UserEntity> createdByOptional = userDao.findByUsernameIgnoreCase("admin");

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
              .title("Hoi thao AI trong giao duc")
              .organizer("Khoa CNTT")
              .description("Chia se ung dung AI trong giang day va hoc tap")
              .location("Hoi truong A1")
              .startTime(LocalDateTime.of(2026, 4, 10, 8, 0))
              .endTime(LocalDateTime.of(2026, 4, 10, 11, 30))
              .createdBy(createdBy)
              .build(),
          EventEntity.builder()
              .semester(semester)
              .criteria(criteria)
              .title("Ngay hoi hien mau sinh vien")
              .organizer("Doan Thanh nien")
              .description("Hoat dong tinh nguyen hien mau nhan dao danh cho sinh vien")
              .location("Nha thi dau")
              .startTime(LocalDateTime.of(2026, 4, 18, 7, 30))
              .endTime(LocalDateTime.of(2026, 4, 18, 11, 0))
              .createdBy(createdBy)
              .build(),
          EventEntity.builder()
              .semester(semester)
              .criteria(criteria)
              .title("Cuoc thi y tuong khoi nghiep")
              .organizer("CLB Khoi nghiep")
              .description("Sinh vien trinh bay y tuong startup va nhan gop y tu giang vien")
              .location("Phong B302")
              .startTime(LocalDateTime.of(2026, 5, 5, 13, 30))
              .endTime(LocalDateTime.of(2026, 5, 5, 17, 0))
              .createdBy(createdBy)
              .build()
      );

      List<EventEntity> eventsToInsert = events.stream()
          .filter(event -> eventDao.findByTitleAndStartTime(event.getTitle(), event.getStartTime())
              .isEmpty())
          .toList();

      if (!eventsToInsert.isEmpty()) {
        eventDao.saveAll(eventsToInsert);
      }
    };
  }
}