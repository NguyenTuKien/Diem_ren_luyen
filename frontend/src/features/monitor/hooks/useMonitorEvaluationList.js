import { useState, useCallback, useMemo } from 'react';
import { getMonitorClassEvaluations } from '../../../api/monitorEvaluationApi';

export function useMonitorEvaluationList(semesterId) {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClassList = useCallback(async () => {
    if (!semesterId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMonitorClassEvaluations(semesterId);
      setStudents(data || []);
    } catch (err) {
      setError(err.message || 'Lỗi khi lấy danh sách đánh giá của lớp.');
    } finally {
      setIsLoading(false);
    }
  }, [semesterId]);

  const stats = useMemo(() => {
    const total = students.length;
    const submittedCount = students.filter(s => !!s.evaluationId && s.status !== 'OPEN' && s.status !== 'DRAFT').length;
    const notSubmittedCount = total - submittedCount;
    
    return {
      total,
      submittedCount,
      notSubmittedCount
    };
  }, [students]);

  return {
    students,
    stats,
    isLoading,
    error,
    fetchClassList,
  };
}
