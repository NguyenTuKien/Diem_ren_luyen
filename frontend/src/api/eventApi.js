import { authFetch } from './authFetch';

const API_BASE_URL = '/api/v1/events';
const API_ADMIN_URL = '/api/v1/admin/events';

export const eventApi = {
  fetchEvents: async (page = 0, size = 10) => {
    const response = await authFetch(`${API_BASE_URL}?page=${page}&size=${size}`);
    if (!response.ok) throw new Error('Không thể tải danh sách sự kiện.');
    return response.json();
  },
  
  createEvent: async (eventData) => {
    const response = await authFetch(API_ADMIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const errorJson = await response.json();
        throw new Error(errorJson.message || errorJson.error || 'Không thể tạo sự kiện.');
      }

      const errorText = await response.text();
      throw new Error(errorText || 'Không thể tạo sự kiện.');
    }

    return response.json();
  },
  
  updateEvent: async (id, eventData) => {
    const response = await authFetch(`${API_ADMIN_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const errorJson = await response.json();
        throw new Error(errorJson.message || errorJson.error || 'Không thể cập nhật sự kiện.');
      }

      const errorText = await response.text();
      throw new Error(errorText || 'Không thể cập nhật sự kiện.');
    }

    return response.json();
  },
  
  deleteEvent: async (id) => {
    const response = await authFetch(`${API_ADMIN_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Không thể xóa sự kiện.');
  }
};
