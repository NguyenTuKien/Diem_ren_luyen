import { useState, useCallback, useMemo } from 'react';
import { getLecturerEvaluationClassList } from '../../../api/evaluationApi';

export function useLecturerEvaluationList(classId, semesterId) {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClassList = useCallback(async () => {
    if (!classId || !semesterId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getLecturerEvaluationClassList({ classId, semesterId });
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Lỗi khi lấy danh sách đánh giá của lớp.');
    } finally {
      setIsLoading(false);
    }
  }, [classId, semesterId]);

  const stats = useMemo(() => {
    const total = students.length;
    // Giảng viên duyệt phiếu MONITOR_APPROVED (đã qua lớp trưởng)
    const approvedByMonitor = students.filter(
      s => s.status === 'MONITOR_APPROVED' || s.status === 'FINALIZED'
    ).length;
    const pendingCount = total - approvedByMonitor;
    return { total, approvedByMonitor, pendingCount };
  }, [students]);

  return { students, stats, isLoading, error, fetchClassList };
}
