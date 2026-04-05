package ct01.n06.backend.service;

import ct01.n06.backend.dto.qrcode.GenerateQrResponse;
import ct01.n06.backend.dto.qrcode.ScanQrRequest;

public interface QrCodeService {
    GenerateQrResponse generateQr(Long eventId);

    void scanQr(ScanQrRequest request, String studentUserId, String deviceId);
}

