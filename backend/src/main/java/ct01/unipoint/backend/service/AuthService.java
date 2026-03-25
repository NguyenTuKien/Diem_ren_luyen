package ct01.unipoint.backend.service;

import ct01.unipoint.backend.dao.UserDao;
import ct01.unipoint.backend.entity.UserEntity;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
@AllArgsConstructor
public class AuthService {
    private static UserDao userDao;

    public static UserEntity resolveCreator() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        String username = authentication.getName();
        Optional<UserEntity> userOpt = userDao.findByUsernameIgnoreCase(username)
                .or(() -> userDao.findByEmailIgnoreCase(username))
                .or(() -> userDao.findByUsername(username))
                .or(() -> userDao.findByEmail(username));
        return userOpt.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
