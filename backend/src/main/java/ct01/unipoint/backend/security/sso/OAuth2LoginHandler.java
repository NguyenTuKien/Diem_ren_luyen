package ct01.unipoint.backend.security.sso;

import ct01.unipoint.backend.security.jwt.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.RedirectStrategy;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2LoginHandler implements AuthenticationSuccessHandler, AuthenticationFailureHandler {

    private final JwtService jwtService;
    private final RedirectStrategy redirectStrategy = new DefaultRedirectStrategy();

    @Value("${spring.app.oauth2.redirect.url:http://localhost:5173}")
    private String frontendRedirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        Object principal = authentication.getPrincipal();
        String username = extractUsername(principal, authentication);
        String accessToken = jwtService.generateAccessToken(username);
        String refreshToken = jwtService.generateRefreshToken(username);
        String targetUrl = UriComponentsBuilder.fromUriString(frontendRedirectUrl)
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .build(true)
                .toUriString();
        redirectStrategy.sendRedirect(request, response, targetUrl);
    }

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {
        String encodedMessage = URLEncoder.encode(exception.getMessage(), StandardCharsets.UTF_8);
        String targetUrl = UriComponentsBuilder.fromUriString(frontendRedirectUrl)
                .queryParam("error", encodedMessage)
                .build(true)
                .toUriString();
        redirectStrategy.sendRedirect(request, response, targetUrl);
    }

    private String extractUsername(Object principal, Authentication authentication) {
        if (principal instanceof OAuth2User oAuth2User) {
            Object email = oAuth2User.getAttributes().get("email");
            if (email == null) {
                email = oAuth2User.getAttributes().get("preferred_username");
            }
            if (email != null && !email.toString().isBlank()) {
                return email.toString();
            }
            return oAuth2User.getName();
        }
        return authentication.getName();
    }
}

