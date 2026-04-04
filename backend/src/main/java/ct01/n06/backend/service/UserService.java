package ct01.n06.backend.service;

import ct01.n06.backend.entity.UserEntity;
import java.util.Optional;

public interface UserService {
    UserEntity requireCurrentUser();

    String requireCurrentUserId();

    UserEntity findByUsername(String username);

    boolean isUserExist(String email);

    Optional<UserEntity> findByUsernameOrEmail(String principalIdentifier);
}

