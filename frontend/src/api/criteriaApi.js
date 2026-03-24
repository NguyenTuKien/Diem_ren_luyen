import { authFetch } from './authFetch';

export const criteriaApi = {
    fetchCriterias: async () => {
        const response = await authFetch('/api/v1/criterias');
        if (!response.ok) throw new Error('Failed to fetch criteria');
        return response.json();
    }
};
