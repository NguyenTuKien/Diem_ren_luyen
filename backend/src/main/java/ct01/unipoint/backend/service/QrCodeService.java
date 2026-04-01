package ct01.unipoint.backend.service;

import ct01.unipoint.backend.dto.qrcode.GenerateQrResponse;
import ct01.unipoint.backend.dto.qrcode.ScanQrRequest;

public interface QrCodeService {
    GenerateQrResponse generateQr(Long eventId);

    void scanQr(ScanQrRequest request, String studentUserId);
}

