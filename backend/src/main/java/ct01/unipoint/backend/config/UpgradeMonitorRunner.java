package ct01.unipoint.backend.config;

import ct01.unipoint.backend.repository.ClassRepository;
import ct01.unipoint.backend.repository.StudentRepository;
import ct01.unipoint.backend.repository.UserRepository;
import ct01.unipoint.backend.entity.ClassEntity;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.entity.enums.Role;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class UpgradeMonitorRunner implements CommandLineRunner {

  private final UserRepository userRepository;
  private final StudentRepository studentRepository;
  private final ClassRepository classRepository;

  public UpgradeMonitorRunner(UserRepository userRepository, StudentRepository studentRepository, ClassRepository classRepository) {
    this.userRepository = userRepository;
    this.studentRepository = studentRepository;
    this.classRepository = classRepository;
  }

  @Override
  @Transactional
  public void run(String... args) {
    // 1. Tìm tài khoản tu_test
    UserEntity user = this.userRepository.findByUsername("tu_test").orElse(null);

    // Nếu tìm thấy và chưa phải Monitor thì mới cập nhật (tránh chạy lại nhiều lần tốn tài nguyên)
    if (user != null && !Role.ROLE_MONITOR.equals(user.getRole())) {

      // Cập nhật quyền Security
      user.setRole(Role.ROLE_MONITOR);
      this.userRepository.save(user);

      // 2. Tìm Student và gán làm Lớp trưởng của Lớp đó
      StudentEntity student = this.studentRepository.findByUserEntity_Username("tu_test").orElse(null);
      if (student != null && student.getClassEntity() != null) {
        ClassEntity clazz = student.getClassEntity();
        clazz.setMonitor(student);
        this.classRepository.save(clazz);
      }

      System.out.println("\n=================================================================");
      System.out.println("ĐÃ THĂNG CẤP TÀI KHOẢN [tu_test] THÀNH LỚP TRƯỞNG (MONITOR)");
      System.out.println("=================================================================\n");
    }
  }
}