package ct01.n06.backend.service;

public interface DeviceBindingService {
    void bindOrValidate(String userId, String deviceToken);

    String getBoundToken(String userId);
}
