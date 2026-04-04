package ct01.n06.backend.service.impl;

import ct01.n06.backend.repository.UserRepository;
import ct01.n06.backend.entity.UserEntity;
import ct01.n06.backend.exception.ApiException;
import ct01.n06.backend.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    @Override
    public UserEntity requireCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Chưa xác thực.");
        }

        String principal = authentication.getName();
        return userRepository.findByUsernameIgnoreCase(principal)
                .or(() -> userRepository.findByEmailIgnoreCase(principal))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ."));
    }

    @Override
    public String requireCurrentUserId() {
        return requireCurrentUser().getId();
    }

    @Override
    public UserEntity findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    @Override
    public boolean isUserExist(String email) {
        return userRepository.existsByEmailIgnoreCase(email);
    }

    @Override
    public Optional<UserEntity> findByUsernameOrEmail(String principalIdentifier) {
        return userRepository.findByUsernameIgnoreCase(principalIdentifier)
                .or(() -> userRepository.findByEmailIgnoreCase(principalIdentifier))
                .or(() -> userRepository.findByUsername(principalIdentifier))
                .or(() -> userRepository.findByEmail(principalIdentifier));
    }
}


