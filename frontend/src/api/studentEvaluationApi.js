import { apiRequest } from '../shared/api/http';

export async function getEvaluationForm(semesterId) {
  // Use apiRequest to fetch the form state for the current student
  const response = await apiRequest(`/api/v1/student/evaluations/form/${semesterId}`);
  // Often backend wraps data inside { data: ... }
  return response.data || response;
}

export async function submitEvaluation(semesterId, payload) {
  // Post payload with { isDraft, detailsJsonb }
  const response = await apiRequest(`/api/v1/student/evaluations/${semesterId}/submit`, {
    method: 'POST',
    body: JSON.stringify({
      isDraft: payload.isDraft,
      detailsJsonb: payload.detailsJsonb
    }),
  });
  return response.data || response;
}
