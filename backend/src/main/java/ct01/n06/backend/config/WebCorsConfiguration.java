package ct01.n06.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class WebCorsConfiguration implements WebMvcConfigurer {

  @Value("${cors.allowed-origins:http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173}")
  private String allowedOrigins;

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    String[] origins = Arrays.stream(StringUtils.commaDelimitedListToStringArray(allowedOrigins))
        .map(String::trim)
        .filter(StringUtils::hasText)
        .toArray(String[]::new);

    registry.addMapping("/**")
        .allowedOriginPatterns(origins.length == 0 ? new String[]{"*"} : origins)
        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        .allowedHeaders("*")
        .allowCredentials(true);
  }
}
