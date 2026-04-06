import { apiRequest } from "./http";

const STUDENT_EVALUATION_BASE = "/v1/student/evaluations";
const MONITOR_EVALUATION_BASE = "/v1/monitor/evaluations";
const LECTURER_EVALUATION_BASE = "/v1/lecturer/evaluations";

function unwrapResponse(payload) {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }
  return payload;
}

function buildQuery(params) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, String(value));
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getStudentEvaluationForm(semesterId) {
  const response = await apiRequest(
    `${STUDENT_EVALUATION_BASE}/form${buildQuery({ semesterId })}`,
  );
  return unwrapResponse(response);
}

export async function submitStudentEvaluation({ semesterId, details, isDraft }) {
  const normalizedDetails = Object.entries(details || {}).reduce((accumulator, [key, value]) => {
    const numericValue = Number(value);
    if (key && Number.isFinite(numericValue)) {
      accumulator[String(key)] = numericValue;
    }
    return accumulator;
  }, {});

  return apiRequest(`${STUDENT_EVALUATION_BASE}/submit`, {
    method: "POST",
    body: JSON.stringify({
      semesterId: Number(semesterId),
      details: normalizedDetails,
      isDraft: Boolean(isDraft),
    }),
  });
}

export async function getMonitorEvaluationClassList(semesterId) {
  const response = await apiRequest(
    `${MONITOR_EVALUATION_BASE}/class-list${buildQuery({ semesterId })}`,
  );
  return unwrapResponse(response);
}

export async function getMonitorEvaluationDetail(evaluationId) {
  const response = await apiRequest(`${MONITOR_EVALUATION_BASE}/${evaluationId}`);
  return unwrapResponse(response);
}

export async function submitMonitorEvaluationReview({ evaluationId, adjustedDetails }) {
  return apiRequest(`${MONITOR_EVALUATION_BASE}/review`, {
    method: "POST",
    body: JSON.stringify({ evaluationId, adjustedDetails }),
  });
}

export async function getLecturerEvaluationClassList({ classId, semesterId }) {
  const response = await apiRequest(
    `${LECTURER_EVALUATION_BASE}/class-list${buildQuery({ classId, semesterId })}`,
  );
  return unwrapResponse(response);
}

export async function getLecturerEvaluationDetail(evaluationId) {
  const response = await apiRequest(`${LECTURER_EVALUATION_BASE}/${evaluationId}`);
  return unwrapResponse(response);
}

export async function submitLecturerEvaluationReview({ evaluationId, adjustedDetails }) {
  return apiRequest(`${LECTURER_EVALUATION_BASE}/review`, {
    method: "POST",
    body: JSON.stringify({ evaluationId, adjustedDetails }),
  });
}

export async function finalizeLecturerEvaluations({ classId, semesterId }) {
  return apiRequest(
    `${LECTURER_EVALUATION_BASE}/finalize${buildQuery({ classId, semesterId })}`,
    {
      method: "POST",
    },
  );
}