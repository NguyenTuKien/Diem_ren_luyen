package ct01.unipoint.backend.security.sso;

import ct01.unipoint.backend.dao.UserDao;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.entity.enums.Role;
import ct01.unipoint.backend.entity.enums.UserStatus;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomOidcUserService extends OidcUserService {

  private final UserDao userDao;
  private final PasswordEncoder passwordEncoder;

  @Override
  public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
    OidcUser delegate = super.loadUser(userRequest);

    String email = delegate.getEmail();
    if (email == null || email.isBlank()) {
      email = delegate.getPreferredUsername();
    }
    if (email == null || email.isBlank()) {
      throw new OAuth2AuthenticationException("Email not provided by provider");
    }
    final String resolvedEmail = email;

    UserEntity userEntity;
    try {
      userEntity = userDao.findByEmail(resolvedEmail)
          .orElseGet(() -> userDao.save(UserEntity.builder()
              .username(generateUniqueUsername(resolvedEmail))
              .email(resolvedEmail)
              .password(passwordEncoder.encode(UUID.randomUUID().toString()))
              .role(Role.ROLE_STUDENT)
              .status(UserStatus.ACTIVE)
              .build()));
    } catch (Exception ex) {
      throw new OAuth2AuthenticationException(
          new OAuth2Error("user_provisioning_failed"),
          "Cannot provision user from Microsoft account",
          ex
      );
    }

    Collection<? extends GrantedAuthority> authorities =
        List.of(new SimpleGrantedAuthority(userEntity.getRole().name()));

    return new DefaultOidcUser(authorities, delegate.getIdToken(), delegate.getUserInfo(), "email");
  }

  private String generateUniqueUsername(String email) {
    String localPart = email;
    int atIndex = email.indexOf('@');
    if (atIndex > 0) {
      localPart = email.substring(0, atIndex);
    }

    String normalized = localPart.toLowerCase(Locale.ROOT)
        .replaceAll("[^a-z0-9._-]", "_")
        .replaceAll("_+", "_")
        .replaceAll("^[._-]+|[._-]+$", "");

    if (normalized.isBlank()) {
      normalized = "user";
    }

    String base = normalized.length() > 40 ? normalized.substring(0, 40) : normalized;
    String candidate = base;
    int suffix = 1;

    while (userDao.findByUsername(candidate).isPresent()) {
      String suffixText = "_" + suffix;
      int maxBaseLength = Math.max(1, 50 - suffixText.length());
      String trimmedBase = base.length() > maxBaseLength ? base.substring(0, maxBaseLength) : base;
      candidate = trimmedBase + suffixText;
      suffix++;
    }

    return candidate;
  }
}
