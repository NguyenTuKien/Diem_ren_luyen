package ct01.unipoint.backend.service;

import ct01.unipoint.backend.entity.UserEntity;

public interface RoleResolverService {

  String resolveEffectiveRole(UserEntity user);

  String resolveDashboardPath(String effectiveRole);
}
