import { authFetch } from './authFetch'

const API_BASE_URL = '/api/v1/qrcode'

export const qrcodeApi = {
  generateQr: async (eventId) => {
    const response = await authFetch(`${API_BASE_URL}/generate?eventId=${eventId}`, {
      method: 'GET',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Không thể tạo phiên điểm danh QR')
    }
    return response.json()
  },

  scanQRCode: async (qrData) => {
    const response = await authFetch(`${API_BASE_URL}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ qrData })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Lỗi lúc quét mã mã QR')
    }
    return response.json()
  }
}
