package ct01.n06.backend.service;

import ct01.n06.backend.dto.qrcode.CheckinByCodeRequest;
import ct01.n06.backend.dto.qrcode.GenerateQrResponse;
import ct01.n06.backend.dto.qrcode.ScanQrRequest;
import ct01.n06.backend.dto.qrcode.ScanTotpRequest;

public interface QrCodeService {
    GenerateQrResponse generateQr(Long eventId);

    void scanQr(ScanQrRequest request, String studentUserId, String deviceId);

    void scanTotp(ScanTotpRequest request, String studentUserId, String deviceId);

    void checkinByCode(CheckinByCodeRequest request, String studentUserId, String deviceId);
}

