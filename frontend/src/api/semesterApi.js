import { authFetch } from './authFetch';

export const semesterApi = {
    fetchSemesters: async () => {
        const response = await authFetch('/api/v1/semesters');
        if (!response.ok) throw new Error('Không thể tải danh sách học kỳ.');
        return response.json();
    }
};
