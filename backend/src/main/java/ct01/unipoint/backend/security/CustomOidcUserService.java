package ct01.unipoint.backend.security;

import ct01.unipoint.backend.dao.UserDao;
import ct01.unipoint.backend.entity.UserEntity;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
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
        final String resolvedEmail = email.trim().toLowerCase(Locale.ROOT);
        // LOGIC MỚI: Kiểm tra DB, ném lỗi thẳng tay nếu không tìm thấy email
        UserEntity userEntity = userDao.findByEmailIgnoreCase(resolvedEmail)
                .orElseThrow(() -> new OAuth2AuthenticationException(
                        new OAuth2Error("user_not_found"),
                        "Tài khoản chưa được đăng ký trong hệ thống. Vui lòng liên hệ Admin!"
                ));

        Collection<? extends GrantedAuthority> authorities =
                List.of(new SimpleGrantedAuthority(userEntity.getRole().name()));

        return new DefaultOidcUser(authorities, delegate.getIdToken(), delegate.getUserInfo(), "email");
    }
}