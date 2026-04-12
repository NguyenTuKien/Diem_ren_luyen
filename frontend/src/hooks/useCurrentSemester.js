import { useState, useEffect } from 'react';
import { apiRequest } from '../shared/api/http';

export function useCurrentSemester() {
  const [semesters, setSemesters] = useState([]);
  const [activeSemesterId, setActiveSemesterId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        setLoading(true);
        // This is the correct API route matching the backend SemesterController (@RequestMapping("/v1/semesters"))
        const responseData = await apiRequest('/v1/semesters');
        
        // Structure thường thấy của ResponseGeneral là trả data ở field data
        const semestersData = responseData?.data || responseData;
        
        if (Array.isArray(semestersData)) {
          setSemesters(semestersData);
          const activeSemester = semestersData.find(sem => sem.isActive === true);
          if (activeSemester) {
            setActiveSemesterId(activeSemester.id);
          } else if (semestersData.length > 0) {
            // Fallback to the latest one if no active flag found
            setActiveSemesterId(semestersData[semestersData.length - 1].id);
          }
        }
      } catch (err) {
        setError(err.message || 'Lỗi lấy thông tin Học kỳ');
      } finally {
        setLoading(false);
      }
    };

    fetchSemesters();
  }, []);

  return { semesters, activeSemesterId, loading, error };
}
