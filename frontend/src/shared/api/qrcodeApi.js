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

  scanQRCode: async ({ qrData, eventId, blueToothId }) => {
    const response = await authFetch(`${API_BASE_URL}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ qrData, eventId, blueToothId }),
    })

    const responseData = await response.json().catch(() => ({}))

    if (!response.ok) {
      const error = new Error(responseData.message || 'Lỗi lúc quét mã QR')
      error.status = response.status
      throw error
    }

    return responseData
  },

  checkinByCode: async ({ pinCode }) => {
    const response = await authFetch(`${API_BASE_URL}/checkin/code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pinCode }),
    })

    const responseData = await response.json().catch(() => ({}))

    if (!response.ok) {
      const error = new Error(responseData.message || 'Lỗi lúc điểm danh bằng PIN')
      error.status = response.status
      throw error
    }

    return responseData
  }
}
