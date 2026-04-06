package ct01.n06.backend.util;

import jakarta.servlet.http.HttpServletRequest;

public class CookieUtils {
    public static String readDeviceTokenFromCookie(HttpServletRequest request, String cookieName) {
        if (request == null || request.getCookies() == null) {
            return null;
        }
        for (var cookie : request.getCookies()) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
