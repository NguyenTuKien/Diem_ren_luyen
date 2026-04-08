package ct01.n06.backend.service.impl;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.util.StringUtils;

import ct01.n06.backend.entity.enums.UserStatus;
import ct01.n06.backend.exception.ApiException;

final class AdminServiceUtils {

  private AdminServiceUtils() {
  }

  static String normalizeKeyword(String keyword) {
    return StringUtils.hasText(keyword) ? keyword.trim().toLowerCase(Locale.ROOT) : null;
  }

  static boolean contains(String value, String keyword) {
    return value != null && value.toLowerCase(Locale.ROOT).contains(keyword);
  }

  static UserStatus parseStatus(String status, boolean allowDefaultActive) {
    if (!StringUtils.hasText(status)) {
      return allowDefaultActive ? UserStatus.ACTIVE : null;
    }

    try {
      return UserStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
    } catch (IllegalArgumentException ex) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Trạng thái không hợp lệ.");
    }
  }

  static UserStatus normalizeStatus(UserStatus status) {
    return status == null ? UserStatus.ACTIVE : status;
  }
}
