import { apiRequest } from '../shared/api/http';

export async function getMonitorClassEvaluations(semesterId) {
  if (!semesterId) return [];
  const response = await apiRequest(`/v1/monitor/evaluations/class-list?semesterId=${semesterId}`);
  return response?.data || response || [];
}

export async function getMonitorEvaluationDetail(evaluationId) {
  if (!evaluationId) return null;
  const response = await apiRequest(`/v1/monitor/evaluations/${evaluationId}`);
  return response?.data || response;
}

export async function submitMonitorReview(evaluationId, adjustedDetails) {
  const payload = {
    evaluationId,
    adjustedDetails
  };
  const response = await apiRequest(`/v1/monitor/evaluations/review`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return response;
}
