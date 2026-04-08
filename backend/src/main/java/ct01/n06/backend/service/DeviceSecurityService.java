package ct01.n06.backend.service;

public interface DeviceSecurityService {
    String generateDeviceToken(String deviceId);

    boolean verifyDeviceToken(String token);

    String extractDeviceId(String token);
}

