import { useState, useEffect } from 'react';
import { authFetch } from '../api/authFetch';

export function useCurrentSemester() {
  const [semesterId, setSemesterId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActiveSemester = async () => {
      try {
        setLoading(true);
        // Tương tự convention của api hiện tại
        const response = await authFetch('/api/v1/semesters');
        if (!response.ok) {
          throw new Error('Failed to fetch semesters');
        }
        const responseData = await response.json();
        
        // Structure thường thấy của ResponseGeneral là trả data ở field data
        const semesters = responseData.data || responseData;
        
        if (Array.isArray(semesters)) {
          const activeSemester = semesters.find(sem => sem.isActive === true);
          if (activeSemester) {
            setSemesterId(activeSemester.id);
          } else {
            throw new Error('Không tìm thấy Học kỳ nào đang được kích hoạt.');
          }
        }
      } catch (err) {
        setError(err.message || 'Lỗi lấy thông tin Học kỳ');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveSemester();
  }, []);

  return { semesterId, loading, error };
}
