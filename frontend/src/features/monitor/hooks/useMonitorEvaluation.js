import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getMonitorEvaluationClassList,
  getMonitorEvaluationDetail,
  submitMonitorEvaluationReview,
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

function normalizeDetailMap(rawMap) {
  if (!rawMap || typeof rawMap !== "object") {
    return {};
  }

  return Object.entries(rawMap).reduce((acc, [key, value]) => {
    const resolvedValue =
      value && typeof value === "object"
        ? value.score ?? value.point ?? value.value ?? value.requestedScore ?? 0
        : value;
    acc[key] = Math.max(0, toNumber(resolvedValue));
    return acc;
  }, {});
}

export function useMonitorEvaluation() {
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);
  const [evaluationRows, setEvaluationRows] = useState([]);
  const [loadingSemesters, setLoadingSemesters] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [reviewDraft, setReviewDraft] = useState({});

  useEffect(() => {
    let mounted = true;

    const loadSemesters = async () => {
      try {
        setLoadingSemesters(true);
        setError("");
        const payload = await apiRequest("/v1/semesters");
        const semesters = Array.isArray(unwrapData(payload)) ? unwrapData(payload) : [];

        if (!mounted) {
          return;
        }

        setSemesterOptions(semesters);
        const activeSemester = pickActiveSemester(semesters);
        setSelectedSemesterId(activeSemester?.id ?? null);
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || "Khong the tai hoc ky.");
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

  const loadClassList = useCallback(async (semesterId) => {
    if (!semesterId) {
      setEvaluationRows([]);
      return;
    }

    try {
      setLoadingList(true);
      setError("");
      setSuccessMessage("");
      const payload = await getMonitorEvaluationClassList(semesterId);
      setEvaluationRows(Array.isArray(payload) ? payload : []);
    } catch (loadError) {
      setError(loadError.message || "Khong the tai danh sach phieu cua lop.");
      setEvaluationRows([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadClassList(selectedSemesterId);
  }, [loadClassList, selectedSemesterId]);

  const openReviewModal = useCallback(async (evaluationId) => {
    if (!evaluationId) {
      return;
    }

    try {
      setLoadingDetail(true);
      setError("");
      const payload = await getMonitorEvaluationDetail(evaluationId);
      const detailMap = normalizeDetailMap(payload?.details);

      setSelectedEvaluation({
        evaluationId,
        status: payload?.status || "SUBMITTED",
        details: detailMap,
      });
      setReviewDraft(detailMap);
    } catch (detailError) {
      setError(detailError.message || "Khong the tai chi tiet phieu.");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const closeReviewModal = useCallback(() => {
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

      await submitMonitorEvaluationReview({
        evaluationId: selectedEvaluation.evaluationId,
        adjustedDetails: reviewDraft,
      });

      setSuccessMessage("Da cap nhat danh gia cho sinh vien.");
      closeReviewModal();
      await loadClassList(selectedSemesterId);
    } catch (reviewError) {
      setError(reviewError.message || "Khong the gui ket qua review.");
    } finally {
      setSubmittingReview(false);
    }
  }, [closeReviewModal, loadClassList, reviewDraft, selectedEvaluation, selectedSemesterId]);

  const summary = useMemo(() => {
    const total = evaluationRows.length;
    const submitted = evaluationRows.filter((row) => String(row.status || "").toUpperCase() === "SUBMITTED").length;
    const reviewed = evaluationRows.filter((row) => String(row.status || "").toUpperCase() === "MONITOR_APPROVED").length;
    return { total, submitted, reviewed };
  }, [evaluationRows]);

  return {
    semesterOptions,
    selectedSemesterId,
    setSelectedSemesterId,
    evaluationRows,
    loadingSemesters,
    loadingList,
    loadingDetail,
    submittingReview,
    error,
    successMessage,
    selectedEvaluation,
    reviewDraft,
    summary,
    openReviewModal,
    closeReviewModal,
    updateReviewScore,
    submitReview,
    refreshList: () => loadClassList(selectedSemesterId),
  };
}