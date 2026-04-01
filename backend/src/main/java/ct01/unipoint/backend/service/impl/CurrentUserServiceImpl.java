package ct01.unipoint.backend.service.impl;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.exception.ApiException;
import ct01.unipoint.backend.repository.UserRepository;
import ct01.unipoint.backend.service.CurrentUserService;

@Service
public class CurrentUserServiceImpl implements CurrentUserService {

  private final UserRepository userRepository;

  public CurrentUserServiceImpl(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

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
  public Long requireCurrentUserId() {
    return requireCurrentUser().getId();
  }
}
