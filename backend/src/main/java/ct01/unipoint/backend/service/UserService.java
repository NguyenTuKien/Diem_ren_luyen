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

    public UserEntity findByUsername(String username) {
        return userDao.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    public boolean isUserExist(String email) {
        return userDao.existsByEmailIgnoreCase(email);
    }

    public Optional<UserEntity> findByUsernameOrEmail(String principalIdentifier) {
        return userDao.findByUsernameIgnoreCase(principalIdentifier)
                .or(() -> userDao.findByEmailIgnoreCase(principalIdentifier))
                .or(() -> userDao.findByUsername(principalIdentifier))
                .or(() -> userDao.findByEmail(principalIdentifier));
    }
}
