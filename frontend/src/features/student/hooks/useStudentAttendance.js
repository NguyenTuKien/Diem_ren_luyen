import { useState, useEffect } from "react";
import { getStudentActivityHistory } from "../../../api/notificationStatisticsApi";

export function useStudentAttendance(userId, semesterId, page = 0, size = 10) {
  const [attendance, setAttendance] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size,
    totalItems: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchAttendance() {
      setLoading(true);
      setError("");
      try {
        const payload = await getStudentActivityHistory({
          semesterId,
          page,
          size,
        });
        if (!ignore) {
          setAttendance(Array.isArray(payload?.items) ? payload.items : []);
          setPagination({
            page: payload?.page ?? page,
            size: payload?.size ?? size,
            totalItems: payload?.totalItems ?? 0,
            totalPages: payload?.totalPages ?? 0,
          });
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    if (userId) {
      fetchAttendance();
    }

    return () => {
      ignore = true;
    };
  }, [userId, semesterId, page, size]);

  return { attendance, pagination, loading, error };
}
