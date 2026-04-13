import { apiRequest } from '../shared/api/http';

/**
 * Admin Semester Management API
 * Base: /v1/admin/semesters
 */

export const getAllSemestersAdmin = () =>
  apiRequest('/v1/admin/semesters');

export const createSemester = (data) =>
  apiRequest('/v1/admin/semesters', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateSemester = (id, data) =>
  apiRequest(`/v1/admin/semesters/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteSemester = (id) =>
  apiRequest(`/v1/admin/semesters/${id}`, {
    method: 'DELETE',
  });

export const toggleActiveSemester = (id) =>
  apiRequest(`/v1/admin/semesters/${id}/activate`, {
    method: 'PATCH',
  });
