import { useCallback, useEffect, useMemo, useState } from "react";
import {
  finalizeLecturerEvaluations,
  getLecturerEvaluationClassList,
  getLecturerEvaluationDetail,
  submitLecturerEvaluationReview,
} from "../../../api/evaluationApi";
import { apiRequest } from "../../../api/http";

function unwrapData(payload) {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }
  return payload;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pickActiveSemester(semesters) {
  if (!Array.isArray(semesters) || semesters.length === 0) {
    return null;
  }

  const active = semesters.find(
    (semester) => semester?.isActive === true || semester?.status === "ACTIVE",
  );

  return active || semesters[0];
}

function normalizeClassOptions(classes) {
  if (!Array.isArray(classes)) {
    return [];
  }

  return classes
    .map((item) => {
      const id = item?.id ?? item?.classId ?? item?.value;
      const code = item?.classCode ?? item?.code ?? "";
      const name = item?.className ?? item?.name ?? "";
      const label = [code, name].filter(Boolean).join(" - ") || `Class ${id}`;

      return {
        id,
        label,
      };
    })
    .filter((item) => item.id !== undefined && item.id !== null);
}

function normalizeDetailMap(rawMap) {
  if (!rawMap || typeof rawMap !== "object") {
    return {};
  }

  return Object.entries(rawMap).reduce((acc, [key, value]) => {
    const scoreValue =
      value && typeof value === "object"
        ? value.score ?? value.point ?? value.value ?? value.requestedScore ?? 0
        : value;
    acc[key] = Math.max(0, toNumber(scoreValue));
    return acc;
  }, {});
}

export function useLecturerEvaluation(lecturerId) {
  const [classOptions, setClassOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);
  const [evaluationRows, setEvaluationRows] = useState([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [reviewDraft, setReviewDraft] = useState({});
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadFilters = async () => {
      if (!lecturerId) {
        setLoadingFilters(false);
        return;
      }

      try {
        setLoadingFilters(true);
        setError("");

        const [semesterPayload, classPayload] = await Promise.all([
          apiRequest("/v1/semesters"),
          apiRequest(`/v1/lecturer/students/options?lecturerId=${lecturerId}`),
        ]);

        if (!mounted) {
          return;
        }

        const semesters = Array.isArray(unwrapData(semesterPayload)) ? unwrapData(semesterPayload) : [];
        const classes = normalizeClassOptions(classPayload?.classes || classPayload?.classOptions || []);

        setSemesterOptions(semesters);
        setClassOptions(classes);

        const activeSemester = pickActiveSemester(semesters);
        setSelectedSemesterId(activeSemester?.id ?? null);
        setSelectedClassId(classes[0]?.id ?? null);
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || "Không thể tải bộ lọc lớp/học kỳ.");
        }
      } finally {
        if (mounted) {
          setLoadingFilters(false);
        }
      }
    };

    loadFilters();

    return () => {
      mounted = false;
    };
  }, [lecturerId]);

  const loadList = useCallback(async (classId, semesterId) => {
    if (!classId || !semesterId) {
      setEvaluationRows([]);
      return;
    }

    try {
      setLoadingList(true);
      setError("");
      setSuccessMessage("");

      const payload = await getLecturerEvaluationClassList({ classId, semesterId });
      setEvaluationRows(Array.isArray(payload) ? payload : []);
    } catch (loadError) {
      setError(loadError.message || "Không thể tải danh sách đánh giá.");
      setEvaluationRows([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadList(selectedClassId, selectedSemesterId);
  }, [loadList, selectedClassId, selectedSemesterId]);

  const openReview = useCallback(async (evaluationId) => {
    if (!evaluationId) {
      return;
    }

    try {
      setLoadingDetail(true);
      setError("");
      const payload = await getLecturerEvaluationDetail(evaluationId);
      const details = normalizeDetailMap(payload?.details);

      setSelectedEvaluation({
        evaluationId,
        status: payload?.status || "MONITOR_APPROVED",
      });
      setReviewDraft(details);
    } catch (detailError) {
      setError(detailError.message || "Không thể tải chi tiết phiếu.");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const closeReview = useCallback(() => {
    setSelectedEvaluation(null);
    setReviewDraft({});
  }, []);

  const updateReviewScore = useCallback((key, value) => {
    const normalized = Math.max(0, toNumber(value));
    setReviewDraft((prev) => ({ ...prev, [key]: normalized }));
  }, []);

  const submitReview = useCallback(async () => {
    if (!selectedEvaluation?.evaluationId) {
      return;
    }

    try {
      setSubmittingReview(true);
      setError("");
      setSuccessMessage("");

      await submitLecturerEvaluationReview({
        evaluationId: selectedEvaluation.evaluationId,
        adjustedDetails: reviewDraft,
      });

      setSuccessMessage("Đã duyệt phiếu đánh giá thành công.");
      closeReview();
      await loadList(selectedClassId, selectedSemesterId);
    } catch (submitError) {
      setError(submitError.message || "Không thể lưu kết quả duyệt.");
    } finally {
      setSubmittingReview(false);
    }
  }, [closeReview, loadList, reviewDraft, selectedClassId, selectedEvaluation, selectedSemesterId]);

  const finalizeClass = useCallback(async () => {
    if (!selectedClassId || !selectedSemesterId) {
      return;
    }

    try {
      setFinalizing(true);
      setError("");
      setSuccessMessage("");

      await finalizeLecturerEvaluations({
        classId: selectedClassId,
        semesterId: selectedSemesterId,
      });

      setSuccessMessage("Đã chốt điểm rèn luyện cho lớp đã chọn.");
      await loadList(selectedClassId, selectedSemesterId);
    } catch (finalizeError) {
      setError(finalizeError.message || "Không thể chốt điểm cho lớp.");
    } finally {
      setFinalizing(false);
    }
  }, [loadList, selectedClassId, selectedSemesterId]);

  const summary = useMemo(() => {
    const total = evaluationRows.length;
    const reviewed = evaluationRows.filter(
      (row) => String(row.status || "").toUpperCase() === "LECTURER_APPROVED",
    ).length;
    const finalized = evaluationRows.filter(
      (row) => String(row.status || "").toUpperCase() === "FINALIZED",
    ).length;
    const average =
      total > 0
        ? Math.round(
            (evaluationRows.reduce(
              (sum, row) => sum + toNumber(row.currentScore ?? row.finalScore ?? row.lecturerScore),
              0,
            ) /
              total) *
              10,
          ) / 10
        : 0;

    return { total, reviewed, finalized, average };
  }, [evaluationRows]);

  return {
    classOptions,
    semesterOptions,
    selectedClassId,
    selectedSemesterId,
    setSelectedClassId,
    setSelectedSemesterId,
    evaluationRows,
    selectedEvaluation,
    reviewDraft,
    loadingFilters,
    loadingList,
    loadingDetail,
    submittingReview,
    finalizing,
    error,
    successMessage,
    summary,
    openReview,
    closeReview,
    updateReviewScore,
    submitReview,
    finalizeClass,
    refreshList: () => loadList(selectedClassId, selectedSemesterId),
  };
}
