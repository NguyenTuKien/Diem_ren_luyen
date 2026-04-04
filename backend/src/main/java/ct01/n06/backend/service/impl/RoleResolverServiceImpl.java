package ct01.n06.backend.service.impl;

import java.util.Optional;

import ct01.n06.backend.repository.ClassRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import ct01.n06.backend.entity.ClassEntity;
import ct01.n06.backend.entity.StudentEntity;
import ct01.n06.backend.entity.UserEntity;
import ct01.n06.backend.entity.enums.Role;
import ct01.n06.backend.repository.StudentRepository;
import ct01.n06.backend.service.RoleResolverService;

@Service
@RequiredArgsConstructor
public class RoleResolverServiceImpl implements RoleResolverService {

  private final StudentRepository studentRepository;
  private final ClassRepository classRepository;


  @Override
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

  @Override
  public String resolveDashboardPath(String effectiveRole) {
    return switch (effectiveRole) {
      case "ADMIN" -> "/dashboard/admin";
      case "LECTURER" -> "/dashboard/lecturer/students";
      case "MONITOR" -> "/dashboard/monitor/class";
      default -> "/dashboard/student";
    };
  }
}
