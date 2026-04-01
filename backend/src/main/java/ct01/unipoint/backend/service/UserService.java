package ct01.unipoint.backend.service;

import ct01.unipoint.backend.entity.UserEntity;
import java.util.Optional;

public interface UserService {
    UserEntity findByUsername(String username);

    boolean isUserExist(String email);

    Optional<UserEntity> findByUsernameOrEmail(String principalIdentifier);
}

