package ct01.unipoint.backend.security;

import ct01.unipoint.backend.dao.UserDao;
import ct01.unipoint.backend.entity.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserDao userDao;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User delegate = super.loadUser(userRequest);

        Map<String, Object> attributes = new HashMap<>(delegate.getAttributes());
        String email = getEmail(attributes);
        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException("Nhà cung cấp SSO chưa trả về email.");
        }
        email = email.trim().toLowerCase(Locale.ROOT);
        String name = getDisplayName(attributes);
        attributes.putIfAbsent("email", email);
        attributes.putIfAbsent("name", name);
        // LOGIC MỚI Ở ĐÂY: Tìm user, nếu không thấy thì ném lỗi ngay lập tức
        UserEntity userEntity = userDao.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new OAuth2AuthenticationException(
                        new OAuth2Error("user_not_found"),
                        "Tài khoản chưa được đăng ký trong hệ thống. Vui lòng liên hệ Admin!"
                ));
        // Nếu user đã bị khóa/vô hiệu hóa, bạn cũng có thể chặn luôn ở đây:
        // if (userEntity.getStatus() != UserStatus.ACTIVE) {
        //     throw new OAuth2AuthenticationException(new OAuth2Error("user_locked"), "Tài khoản của bạn đã bị khóa!");
        // }
        Collection<? extends GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(userEntity.getRole().name()));
        return new DefaultOAuth2User(authorities, attributes, "email");
    }

    private String getEmail(Map<String, Object> attributes) {
        Object email = attributes.get("email");
        if (email == null) {
            email = attributes.get("preferred_username");
        }
        return email != null ? email.toString() : null;
    }
    
    private String getDisplayName(Map<String, Object> attributes) {
        Object name = attributes.get("name");
        if (name == null) {
            name = attributes.get("displayName");
        }
        return name != null ? name.toString() : "";
    }
}

