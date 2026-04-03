import { authFetch } from '../api/authFetch';

const API_V1_STUDENT = '/api/v1/student/evaluations';
const API_V1_MONITOR = '/api/v1/monitor/evaluations';
const API_V1_LECTURER = '/api/v1/lecturer/evaluations';

const handleResponse = async (response) => {
  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const errorJson = await response.json();
      throw new Error(errorJson.message || errorJson.error || 'Request failed');
    }
    const errorText = await response.text();
    throw new Error(errorText || 'Request failed');
  }
  return response.json();
};

export const evaluationService = {
  // Student
  getStudentForm: async (semesterId) => {
    const response = await authFetch(`${API_V1_STUDENT}/form?semesterId=${semesterId}`);
    return handleResponse(response);
  },
  submitEvaluation: async (data) => {
    const response = await authFetch(`${API_V1_STUDENT}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Class List wrappers
  getClassListMonitor: async (semesterId) => {
    const response = await authFetch(`${API_V1_MONITOR}/class-list?semesterId=${semesterId}`);
    return handleResponse(response);
  },
  getClassListLecturer: async (classId, semesterId) => {
    const response = await authFetch(`${API_V1_LECTURER}/class-list?classId=${classId}&semesterId=${semesterId}`);
    return handleResponse(response);
  },

  // Detail viewing
  getDetailMonitor: async (evaluationId) => {
    const response = await authFetch(`${API_V1_MONITOR}/${evaluationId}`);
    return handleResponse(response);
  },
  getDetailLecturer: async (evaluationId) => {
    const response = await authFetch(`${API_V1_LECTURER}/${evaluationId}`);
    return handleResponse(response);
  },

  // Review & Finalize
  reviewEvaluationMonitor: async (data) => {
    const response = await authFetch(`${API_V1_MONITOR}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  reviewEvaluationLecturer: async (data) => {
    const response = await authFetch(`${API_V1_LECTURER}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  finalizeClass: async (semesterId, classId) => {
    const response = await authFetch(`${API_V1_LECTURER}/finalize?classId=${classId}&semesterId=${semesterId}`, {
      method: 'POST',
    });
    return handleResponse(response);
  }
};
