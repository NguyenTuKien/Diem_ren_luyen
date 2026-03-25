package ct01.unipoint.backend.security.sso;

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
<<<<<<< HEAD
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
=======

        UserEntity userEntity;
        try {
            userEntity = userDao.findByEmail(email)
                .orElseGet(() -> userDao.save(UserEntity.builder()
                    .username(generateUniqueUsername(email))
                    .email(email)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role(Role.ROLE_STUDENT)
                    .status(UserStatus.ACTIVE)
                    .build()));
        } catch (Exception ex) {
            throw new OAuth2AuthenticationException(
                new OAuth2Error("user_provisioning_failed"),
                "Không thể tạo tài khoản từ Microsoft SSO.",
                ex
            );
        }

>>>>>>> 5f6b687e64570063f6f6e8eb6ff7f9e390eb9956
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
<<<<<<< HEAD
}
=======

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
>>>>>>> 5f6b687e64570063f6f6e8eb6ff7f9e390eb9956
