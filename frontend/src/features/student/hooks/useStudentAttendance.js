import { useState, useEffect } from "react";
import { apiRequest } from "../../../shared/api/http";

export function useStudentAttendance(userId) {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchAttendance() {
      setLoading(true);
      setError("");
      try {
        const payload = await apiRequest("/student/attendance");
        if (!ignore) {
          setAttendance(payload || []);
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
  }, [userId]);

  return { attendance, loading, error };
}
