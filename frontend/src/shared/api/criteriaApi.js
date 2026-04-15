import { authFetch } from './authFetch';

export const criteriaApi = {
    fetchCriterias: async () => {
        const response = await authFetch('/api/v1/criterias');
        if (!response.ok) throw new Error('Không thể tải danh sách tiêu chí.');
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
