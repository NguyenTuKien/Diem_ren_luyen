package ct01.unipoint.backend.config;

import ct01.unipoint.backend.dao.CriteriaDao;
import ct01.unipoint.backend.dao.EventDao;
import ct01.unipoint.backend.dao.FacultyDao;
import ct01.unipoint.backend.dao.LecturerDao;
import ct01.unipoint.backend.dao.SemesterDao;
import ct01.unipoint.backend.dao.UserDao;
import ct01.unipoint.backend.entity.CriteriaEntity;
import ct01.unipoint.backend.entity.EventEntity;
import ct01.unipoint.backend.entity.FacultyEntity;
import ct01.unipoint.backend.entity.LecturerEntity;
import ct01.unipoint.backend.entity.SemesterEntity;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.entity.enums.EventStatus;
import ct01.unipoint.backend.entity.enums.Role;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Configuration
public class DataInitialization {

    @Bean
    @Order(1)
    @Transactional
    CommandLineRunner initFaculty(FacultyDao facultyDao) {
        return args -> {
            if(facultyDao.count() == 0) {
                // Sử dụng List.of để khởi tạo danh sách nhanh và chuẩn xác
                List<FacultyEntity> facultyEntities = List.of(
                        FacultyEntity.builder().code("CNTT").name("Công nghệ thông tin").build(),
                        FacultyEntity.builder().code("CB").name("Cơ bản").build(),
                        FacultyEntity.builder().code("QTKD").name("Quản trị kinh doanh").build()
                );
                facultyDao.saveAll(facultyEntities);
            }
        };
    }

    @Bean // Đã thêm @Bean
    @Order(2)
    @Transactional
    CommandLineRunner initAdmin(LecturerDao lecturerDao, UserDao userDao, FacultyDao facultyDao, PasswordEncoder passwordEncoder) {
        return args -> {
            if(lecturerDao.countByUserEntity_Role(Role.ROLE_ADMIN) == 0) {
                UserEntity userEntity = userDao.save(UserEntity.builder()
                        .username("admin")
                        .email("admin@ptit.edu.vn")
                        .password(passwordEncoder.encode("AdminPassword@123")) // Đã mã hóa mật khẩu
                        .role(Role.ROLE_ADMIN)
                        .build());

                LecturerEntity lecturerEntity = LecturerEntity.builder()
                        .userEntity(userEntity)
                        .lecturerCode("Admin")
                        .fullName("Quản trị viên")
                        .facultyEntity(facultyDao.findByCode("CNTT").orElseThrow())
                        .build();
                lecturerDao.save(lecturerEntity);
            }
        };
    }

    @Bean // Đã thêm @Bean
    @Order(3)
    @Transactional
    CommandLineRunner initLecturer(LecturerDao lecturerDao, UserDao userDao, FacultyDao facultyDao, PasswordEncoder passwordEncoder) {
        return args -> {
            if(lecturerDao.countByUserEntity_Role(Role.ROLE_LECTURER) == 0) {
                UserEntity userEntity = userDao.save(UserEntity.builder()
                        .username("GV001")
                        .email("AGV.GV001@ptit.edu.vn")
                        .password(passwordEncoder.encode("GV001@123")) // Đã mã hóa mật khẩu
                        .role(Role.ROLE_LECTURER)
                        .build());

                LecturerEntity lecturerEntity = LecturerEntity.builder()
                        .userEntity(userEntity)
                        .lecturerCode("GV001")
                        .fullName("Giảng viên A")
                        .facultyEntity(facultyDao.findByCode("CNTT").orElseThrow())
                        .build();
                lecturerDao.save(lecturerEntity);
            }
        };
    }

    @Bean
    @Order(4)
    @Transactional
    CommandLineRunner initSemester(SemesterDao semesterDao) {
        return args -> {
            List<SemesterEntity> semesters = List.of(
                    SemesterEntity.builder().name("HK1-2026").startDate(LocalDate.of(2026, 1, 6)).endDate(LocalDate.of(2026, 5, 31)).isActive(true).build(),
                    SemesterEntity.builder().name("HK2-2026").startDate(LocalDate.of(2026, 8, 15)).endDate(LocalDate.of(2026, 12, 31)).isActive(false).build(),
                    SemesterEntity.builder().name("HK1-2027").startDate(LocalDate.of(2027, 1, 5)).endDate(LocalDate.of(2027, 5, 30)).isActive(false).build()
            );
            for (SemesterEntity semester : semesters) {
                if (semesterDao.findByName(semester.getName()).isEmpty()) {
                    semesterDao.save(semester);
                }
            }
        };
    }

    @Bean
    @Order(5)
    @Transactional
    CommandLineRunner initCriteria(CriteriaDao criteriaDao) {
        return args -> {
            List<CriteriaEntity> criteriaList = List.of(
                    CriteriaEntity.builder().code("HD01").name("Tham gia hoạt động ngoại khóa").pointPerItem(BigDecimal.valueOf(2.0)).maxPoint(BigDecimal.valueOf(20.0)).requireEvidence(true).build(),
                    CriteriaEntity.builder().code("NCKH").name("Nghiên cứu khoa học").pointPerItem(BigDecimal.valueOf(5.0)).maxPoint(BigDecimal.valueOf(10.0)).requireEvidence(true).build(),
                    CriteriaEntity.builder().code("SV5T").name("Sinh viên 5 tốt").pointPerItem(BigDecimal.valueOf(10.0)).maxPoint(BigDecimal.valueOf(10.0)).requireEvidence(true).build(),
                    CriteriaEntity.builder().code("CTXH").name("Công tác xã hội").pointPerItem(BigDecimal.valueOf(2.0)).maxPoint(BigDecimal.valueOf(10.0)).requireEvidence(false).build()
            );
            for (CriteriaEntity criteria : criteriaList) {
                if (criteriaDao.findByCode(criteria.getCode()).isEmpty()) {
                    criteriaDao.save(criteria);
                }
            }
        };
    }

    @Bean
    @Order(6)
    @Transactional
    CommandLineRunner initEvent(EventDao eventDao, SemesterDao semesterDao, CriteriaDao criteriaDao, UserDao userDao) {
        return args -> {
            Optional<SemesterEntity> semesterOptional = semesterDao.findByName("HK1-2026");
            Optional<CriteriaEntity> criteriaOptional = criteriaDao.findByCode("HD01");
            Optional<UserEntity> createdByOptional = userDao.findByUsername("admin");

            if (semesterOptional.isEmpty() || criteriaOptional.isEmpty() || createdByOptional.isEmpty()) {
                return;
            }

            SemesterEntity semester = semesterOptional.get();
            CriteriaEntity criteria = criteriaOptional.get();
            UserEntity createdBy = createdByOptional.get();

            List<EventEntity> eventEntities = List.of(
                    EventEntity.builder()
                            .semester(semester)
                            .criteria(criteria)
                            .title("Hội thảo AI trong giáo dục")
                            .organizer("Khoa CNTT")
                            .description("Chia sẻ ứng dụng AI trong giảng dạy và học tập.")
                            .location("Hội trường A1")
                            .startTime(LocalDateTime.of(2026, 4, 10, 8, 0))
                            .endTime(LocalDateTime.of(2026, 4, 10, 11, 30))
                            .createdBy(createdBy)
                            .status(EventStatus.UPCOMING)
                            .build(),
                    EventEntity.builder()
                            .semester(semester)
                            .criteria(criteria)
                            .title("Ngày hội hiến máu sinh viên")
                            .organizer("Đoàn Thanh niên")
                            .description("Hoạt động tình nguyện hiến máu nhân đạo dành cho sinh viên.")
                            .location("Nhà thi đấu")
                            .startTime(LocalDateTime.of(2026, 4, 18, 7, 30))
                            .endTime(LocalDateTime.of(2026, 4, 18, 11, 0))
                            .createdBy(createdBy)
                            .status(EventStatus.UPCOMING)
                            .build(),
                    EventEntity.builder()
                            .semester(semester)
                            .criteria(criteria)
                            .title("Cuộc thi ý tưởng khởi nghiệp")
                            .organizer("CLB Khởi nghiệp")
                            .description("Sinh viên trình bày ý tưởng startup và nhận góp ý từ giảng viên.")
                            .location("Phòng B302")
                            .startTime(LocalDateTime.of(2026, 5, 5, 13, 30))
                            .endTime(LocalDateTime.of(2026, 5, 5, 17, 0))
                            .createdBy(createdBy)
                            .status(EventStatus.UPCOMING)
                            .build()
            );

            List<EventEntity> eventsToInsert = eventEntities.stream()
                    .filter(event -> eventDao.findByTitleAndStartTime(event.getTitle(), event.getStartTime()).isEmpty())
                    .toList();

            if (!eventsToInsert.isEmpty()) {
                eventDao.saveAll(eventsToInsert);
            }
        };
    }
}