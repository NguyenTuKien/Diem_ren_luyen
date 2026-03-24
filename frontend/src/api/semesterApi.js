import { authFetch } from './authFetch';

export const semesterApi = {
    fetchSemesters: async () => {
        const response = await authFetch('/api/v1/semesters');
        if (!response.ok) throw new Error('Failed to fetch semesters');
        return response.json();
    }
};
