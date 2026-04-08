package ct01.n06.backend.service.impl;

import ct01.n06.backend.exception.ApiException;
import ct01.n06.backend.service.TotpService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.codec.binary.Base32;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.OptionalLong;

@Service
@RequiredArgsConstructor
public class TotpServiceImpl implements TotpService {

    private static final int SECRET_BYTES = 20;
    private static final int TIME_STEP_SECONDS = 30;
    private static final int DIGITS = 6;
    private static final int DRIFT_WINDOWS = 1;
    private static final String HMAC_ALGORITHM = "HmacSHA1";

    private final SecureRandom secureRandom = new SecureRandom();
    private final Base32 base32 = new Base32();

    @Override
    public String generateSecretKey() {
        byte[] buffer = new byte[SECRET_BYTES];
        secureRandom.nextBytes(buffer);
        return base32.encodeToString(buffer).replace("=", "");
    }

    @Override
    public String generateTotp(String secretKey, long epochSeconds) {
        long timeStep = epochSeconds / TIME_STEP_SECONDS;
        return generateTotpForStep(secretKey, timeStep);
    }

    @Override
    public OptionalLong validateTotpWithDrift(String secretKey, String code, long epochSeconds) {
        if (secretKey == null || secretKey.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Thiếu secretKey");
        }
        if (code == null || !code.matches("\\d{" + DIGITS + "}")) {
            return OptionalLong.empty();
        }
        long currentStep = epochSeconds / TIME_STEP_SECONDS;
        for (long offset = -DRIFT_WINDOWS; offset <= DRIFT_WINDOWS; offset++) {
            long candidateStep = currentStep + offset;
            if (generateTotpForStep(secretKey, candidateStep).equals(code)) {
                return OptionalLong.of(candidateStep);
            }
        }
        return OptionalLong.empty();
    }

    private String generateTotpForStep(String secretKey, long timeStep) {
        try {
            byte[] decodedKey = base32.decode(secretKey);
            ByteBuffer buffer = ByteBuffer.allocate(8);
            buffer.putLong(timeStep);

            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(decodedKey, HMAC_ALGORITHM));
            byte[] hash = mac.doFinal(buffer.array());

            int offset = hash[hash.length - 1] & 0x0F;
            int binary = ((hash[offset] & 0x7F) << 24)
                    | ((hash[offset + 1] & 0xFF) << 16)
                    | ((hash[offset + 2] & 0xFF) << 8)
                    | (hash[offset + 3] & 0xFF);

            int otp = binary % (int) Math.pow(10, DIGITS);
            return String.format("%0" + DIGITS + "d", otp);
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tạo mã TOTP");
        }
    }
}

