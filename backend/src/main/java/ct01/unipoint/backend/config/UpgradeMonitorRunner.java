package ct01.unipoint.backend.config;

import ct01.unipoint.backend.dao.ClassDao;
import ct01.unipoint.backend.dao.StudentDao;
import ct01.unipoint.backend.dao.UserDao;
import ct01.unipoint.backend.entity.ClassEntity;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.entity.enums.Role;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class UpgradeMonitorRunner implements CommandLineRunner {

  private final UserDao userDao;
  private final StudentDao studentDao;
  private final ClassDao classDao;

  public UpgradeMonitorRunner(UserDao userDao, StudentDao studentDao, ClassDao classDao) {
    this.userDao = userDao;
    this.studentDao = studentDao;
    this.classDao = classDao;
  }

  @Override
  @Transactional
  public void run(String... args) {
    // 1. Tìm tài khoản tu_test
    UserEntity user = this.userDao.findByUsername("tu_test").orElse(null);

    // Nếu tìm thấy và chưa phải Monitor thì mới cập nhật (tránh chạy lại nhiều lần tốn tài nguyên)
    if (user != null && !Role.ROLE_MONITOR.equals(user.getRole())) {

      // Cập nhật quyền Security
      user.setRole(Role.ROLE_MONITOR);
      this.userDao.save(user);

      // 2. Tìm Student và gán làm Lớp trưởng của Lớp đó
      StudentEntity student = this.studentDao.findByUserEntity_Username("tu_test").orElse(null);
      if (student != null && student.getClassEntity() != null) {
        ClassEntity clazz = student.getClassEntity();
        clazz.setMonitor(student);
        this.classDao.save(clazz);
      }

      System.out.println("\n=================================================================");
      System.out.println("ĐÃ THĂNG CẤP TÀI KHOẢN [tu_test] THÀNH LỚP TRƯỞNG (MONITOR)");
      System.out.println("=================================================================\n");
    }
  }
}