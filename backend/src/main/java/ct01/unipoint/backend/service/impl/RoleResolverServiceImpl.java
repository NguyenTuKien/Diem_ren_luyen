package ct01.unipoint.backend.service.impl;

import java.util.Optional;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import ct01.unipoint.backend.entity.ClassEntity;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.entity.enums.Role;
import ct01.unipoint.backend.dao.ClassDao;
import ct01.unipoint.backend.dao.StudentDao;
import ct01.unipoint.backend.service.RoleResolverService;

@Service
@RequiredArgsConstructor
public class RoleResolverServiceImpl implements RoleResolverService {

  private final StudentDao studentDao;
  private final ClassDao classDao;


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
      Optional<StudentEntity> studentOpt = studentDao.findByUserEntityId(user.getId());
      if (studentOpt.isPresent()) {
        Optional<ClassEntity> monitorClass = classDao.findByMonitor_Id(studentOpt.get().getId());
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
