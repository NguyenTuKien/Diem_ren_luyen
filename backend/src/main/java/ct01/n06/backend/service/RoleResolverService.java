package ct01.n06.backend.service;

import ct01.n06.backend.entity.UserEntity;

public interface RoleResolverService {

  String resolveEffectiveRole(UserEntity user);

  String resolveDashboardPath(String effectiveRole);
}
