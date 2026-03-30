import { authFetch } from './authFetch';

export const criteriaApi = {
    fetchCriterias: async () => {
        const response = await authFetch('/api/v1/criterias');
        if (!response.ok) throw new Error('Không thể tải danh sách tiêu chí.');
        return response.json();
    }
};
