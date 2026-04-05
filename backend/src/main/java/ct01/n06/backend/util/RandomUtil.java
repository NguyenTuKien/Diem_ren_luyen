package ct01.n06.backend.util;

import java.security.SecureRandom;

public class RandomUtil {

    // Khởi tạo một lần (Singleton pattern cho SecureRandom) để tối ưu hiệu năng
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // Private constructor để ngăn chặn việc khởi tạo (instantiate) class Utility này
    private RandomUtil() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    /**
     * Tạo mã PIN ngẫu nhiên gồm 6 chữ số (bao gồm cả số 0 ở đầu nếu có).
     * Ví dụ: "012345", "987654", "000123"
     *
     * @return Chuỗi String chứa 6 chữ số ngẫu nhiên.
     */
    public static String generate6DigitPin() {
        // Sinh một số ngẫu nhiên từ 0 đến 999999
        int pin = SECURE_RANDOM.nextInt(1000000);

        // Format chuỗi: %06d đảm bảo luôn có đủ 6 ký tự, nếu thiếu sẽ bù số 0 vào bên trái
        return String.format("%06d", pin);
    }

    /**
     * Tùy chọn thêm: Hàm tạo chuỗi ngẫu nhiên chữ + số (nếu sau này bạn cần cho mã Code khác)
     */
    public static String generateRandomAlphaNumeric(int length) {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int index = SECURE_RANDOM.nextInt(characters.length());
            sb.append(characters.charAt(index));
        }
        return sb.toString();
    }
}
