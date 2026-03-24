package ct01.unipoint.backend.service;

import ct01.unipoint.backend.dao.UserDao;
import ct01.unipoint.backend.entity.UserEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class UserService {
    private final UserDao userDao;

    public boolean isUserExist(String email) {
        return userDao.existsByEmail(email);
    }

    public Optional<UserEntity> findByUsernameOrEmail(String principalIdentifier) {
        return userDao.findByUsername(principalIdentifier)
                .or(() -> userDao.findByEmail(principalIdentifier));
    }
}
