import { useState, useCallback } from 'react';
import { getStudentEvaluationForm, submitStudentEvaluation, getAllCriteria } from '../../../api/evaluationApi';

export function useStudentEvaluationForm(semesterId) {
  const [formData, setFormData] = useState(null);
  const [criteriaList, setCriteriaList] = useState([]);
  const [selfScores, setSelfScores] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchForm = useCallback(async () => {
    if (!semesterId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [data, criteriaData] = await Promise.all([
        getStudentEvaluationForm(semesterId),
        getAllCriteria()
      ]);
      setFormData(data);
      setCriteriaList(criteriaData || []);
      
      // Backend returns Map<String, Double> in 'details' or similar
      if (data?.details) {
        setSelfScores(data.details);
      } else if (data?.detailsJsonb) {
        setSelfScores(data.detailsJsonb);
      } else {
        setSelfScores({});
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi lấy thông tin phiếu rèn luyện');
    } finally {
      setIsLoading(false);
    }
  }, [semesterId]);

  const handleScoreChange = (criteriaCode, value, maxPoint) => {
    let numericValue = parseInt(value, 10) || 0;
    if (numericValue > maxPoint) {
      numericValue = maxPoint;
    }
    if (numericValue < 0) {
      numericValue = 0;
    }

    setSelfScores(prev => ({
      ...prev,
      [criteriaCode]: numericValue
    }));
  };

  const handleSubmit = async (isDraft) => {
    if (!semesterId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await submitStudentEvaluation({
        semesterId: semesterId,
        isDraft,
        details: selfScores
      });
      alert(isDraft ? 'Đã lưu nháp thành công!' : 'Đã nộp phiếu rèn luyện chính thức!');
      await fetchForm();
    } catch (err) {
      setError(err.message || 'Lỗi khi nộp phiếu');
      alert(err.message || 'Lỗi khi nộp phiếu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    criteriaList,
    selfScores,
    isLoading,
    isSubmitting,
    error,
    fetchForm,
    handleScoreChange,
    handleSubmit
  };
}
