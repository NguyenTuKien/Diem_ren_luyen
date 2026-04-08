package ct01.n06.backend.service;

import java.util.OptionalLong;

public interface TotpService {
    String generateSecretKey();

    String generateTotp(String secretKey, long epochSeconds);

    OptionalLong validateTotpWithDrift(String secretKey, String code, long epochSeconds);

    default OptionalLong validateTotpWithDrift(String secretKey, String code) {
        return validateTotpWithDrift(secretKey, code, java.time.Instant.now().getEpochSecond());
    }
}

