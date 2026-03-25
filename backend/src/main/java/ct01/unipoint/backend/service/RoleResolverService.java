package ct01.unipoint.backend.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import ct01.unipoint.backend.entity.ClassEntity;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.entity.enums.Role;
import ct01.unipoint.backend.repository.ClassRepository;
import ct01.unipoint.backend.repository.StudentRepository;

@Service
public class RoleResolverService {

  private final StudentRepository studentRepository;
  private final ClassRepository classRepository;

  public RoleResolverService(StudentRepository studentRepository, ClassRepository classRepository) {
    this.studentRepository = studentRepository;
    this.classRepository = classRepository;
  }

  public String resolveEffectiveRole(UserEntity user) {
    if (user.getRole() == Role.ROLE_ADMIN) {
      return "ADMIN";
    }
    if (user.getRole() == Role.ROLE_LECTURER) {
      return "LECTURER";
    }
    if (user.getRole() == Role.ROLE_MONITOR) {
      return "MONITOR";
    }
    if (user.getRole() == Role.ROLE_STUDENT) {
      Optional<StudentEntity> studentOpt = studentRepository.findByUserEntityId(user.getId());
      if (studentOpt.isPresent()) {
        Optional<ClassEntity> monitorClass = classRepository.findByMonitor_Id(studentOpt.get().getId());
        if (monitorClass.isPresent()) {
          return "MONITOR";
        }
      }
      return "STUDENT";
    }
    return "STUDENT";
  }

  public String resolveDashboardPath(String effectiveRole) {
    return switch (effectiveRole) {
      case "ADMIN" -> "/dashboard/admin";
      case "LECTURER" -> "/dashboard/lecturer/students";
      case "MONITOR" -> "/dashboard/monitor/class";
      default -> "/dashboard/student";
    };
  }
}
