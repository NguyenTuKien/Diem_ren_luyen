package ct01.unipoint.backend.service;

import ct01.unipoint.backend.entity.UserEntity;

public interface CurrentUserService {

  UserEntity requireCurrentUser();

  Long requireCurrentUserId();
}
