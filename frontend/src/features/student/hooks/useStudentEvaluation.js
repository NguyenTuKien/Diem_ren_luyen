import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getStudentEvaluationForm,
  submitStudentEvaluation,
} from "../../../api/evaluationApi";
import { apiRequest } from "../../../api/http";

const STATUS_CAN_EDIT = new Set(["NOT_SUBMITTED", "DRAFT"]);
const EVENT_FIELD_KEYWORDS = ["EVENT", "ATTEND", "QR", "SOCIAL"];

function unwrapData(payload) {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }
  return payload;
}

function toNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (value && typeof value === "object") {
    const nestedValue = value.score ?? value.point ?? value.value ?? value.requestedScore ?? 0;
    return toNumber(nestedValue);
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeScoreMap(rawMap) {
  if (!rawMap || typeof rawMap !== "object") {
    return {};
  }

  return Object.entries(rawMap).reduce((accumulator, [key, value]) => {
    accumulator[key] = Math.max(0, toNumber(value));
    return accumulator;
  }, {});
}

function pickActiveSemester(semesters) {
  if (!Array.isArray(semesters) || semesters.length === 0) {
    return null;
  }

  const activeSemester = semesters.find(
    (semester) => semester?.isActive === true || semester?.status === "ACTIVE",
  );

  return activeSemester || semesters[0];
}

function isEventLockedField(fieldKey) {
  const upperKey = String(fieldKey || "").toUpperCase();
  return EVENT_FIELD_KEYWORDS.some((keyword) => upperKey.includes(keyword));
}

export function useStudentEvaluation() {
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);
  const [formState, setFormState] = useState({
    evaluationId: null,
    status: "NOT_SUBMITTED",
    finalScore: 0,
    autoScores: {},
    details: {},
  });
  const [detailInputs, setDetailInputs] = useState({});
  const [loadingSemesters, setLoadingSemesters] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isEditable = useMemo(
    () => STATUS_CAN_EDIT.has(String(formState.status || "").toUpperCase()),
    [formState.status],
  );

  const totalSystemScore = useMemo(
    () => Object.values(formState.autoScores).reduce((sum, value) => sum + toNumber(value), 0),
    [formState.autoScores],
  );

  const totalStudentScore = useMemo(
    () => Object.values(detailInputs).reduce((sum, value) => sum + toNumber(value), 0),
    [detailInputs],
  );

  const loadForm = useCallback(async (semesterId) => {
    if (!semesterId) {
      return;
    }

    try {
      setLoadingForm(true);
      setError("");
      setSuccessMessage("");

      const payload = await getStudentEvaluationForm(semesterId);
      const nextAutoScores = normalizeScoreMap(payload?.autoScores);
      const nextDetails = normalizeScoreMap(payload?.details);

      setFormState({
        evaluationId: payload?.evaluationId ?? null,
        status: payload?.status || "NOT_SUBMITTED",
        finalScore: toNumber(payload?.finalScore),
        autoScores: nextAutoScores,
        details: nextDetails,
      });
      setDetailInputs(nextDetails);
    } catch (fetchError) {
      setError(fetchError.message || "Không thể tải phiếu đánh giá.");
    } finally {
      setLoadingForm(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadSemesters = async () => {
      try {
        setLoadingSemesters(true);
        setError("");
        const payload = await apiRequest("/v1/semesters");
        const semesters = unwrapData(payload);

        if (!mounted) {
          return;
        }

        const normalizedSemesters = Array.isArray(semesters) ? semesters : [];
        setSemesterOptions(normalizedSemesters);

        const selectedSemester = pickActiveSemester(normalizedSemesters);
        setSelectedSemesterId(selectedSemester?.id ?? null);
      } catch (fetchError) {
        if (mounted) {
          setError(fetchError.message || "Không thể tải học kỳ.");
        }
      } finally {
        if (mounted) {
          setLoadingSemesters(false);
        }
      }
    };

    loadSemesters();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    loadForm(selectedSemesterId);
  }, [loadForm, selectedSemesterId]);

  const updateDetailScore = useCallback((key, value) => {
    if (!isEditable || isEventLockedField(key)) {
      return;
    }

    const normalizedValue = Math.max(0, toNumber(value));
    setDetailInputs((prev) => ({ ...prev, [key]: normalizedValue }));
  }, [isEditable]);

  const submit = useCallback(
    async (isDraft) => {
      if (!selectedSemesterId) {
        setError("Không xác định được học kỳ để gửi phiếu.");
        return;
      }

      const submitDetails = Object.entries(detailInputs || {}).reduce((accumulator, [key, value]) => {
        const numericValue = Number(value);
        if (key && Number.isFinite(numericValue)) {
          accumulator[String(key)] = numericValue;
        }
        return accumulator;
      }, {});

      if (!isDraft && Object.keys(submitDetails).length === 0) {
        setError("Vui lòng tự đánh giá ít nhất 1 tiêu chí trước khi nộp phiếu.");
        return;
      }

      try {
        setSubmitting(true);
        setError("");
        setSuccessMessage("");

        await submitStudentEvaluation({
          semesterId: selectedSemesterId,
          details: submitDetails,
          isDraft,
        });

        setSuccessMessage(isDraft ? "Đã lưu nháp phiếu đánh giá." : "Đã nộp phiếu đánh giá.");
        if (!isDraft) {
          setFormState((prev) => ({ ...prev, status: "SUBMITTED" }));
        }
      } catch (submitError) {
        setError(submitError.message || "Không thể gửi phiếu đánh giá.");
      } finally {
        setSubmitting(false);
      }
    },
    [detailInputs, selectedSemesterId],
  );

  const refresh = useCallback(() => {
    loadForm(selectedSemesterId);
  }, [loadForm, selectedSemesterId]);

  return {
    semesterOptions,
    selectedSemesterId,
    setSelectedSemesterId,
    formState,
    detailInputs,
    loadingSemesters,
    loadingForm,
    submitting,
    error,
    successMessage,
    isEditable,
    totalSystemScore,
    totalStudentScore,
    isEventLockedField,
    updateDetailScore,
    submit,
    refresh,
  };
}
