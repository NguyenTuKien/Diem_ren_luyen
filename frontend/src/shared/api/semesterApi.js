import { authFetch } from './authFetch';

export const semesterApi = {
    fetchSemesters: async () => {
        const response = await authFetch('/api/v1/semesters');
        if (!response.ok) throw new Error('Không thể tải danh sách học kỳ.');
        const payload = await response.json();

        if (Array.isArray(payload)) {
            return payload;
        }

        if (Array.isArray(payload?.data)) {
            return payload.data;
        }

        return [];
    }
};
