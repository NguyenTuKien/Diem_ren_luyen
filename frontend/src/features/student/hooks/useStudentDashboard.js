import { useState, useEffect } from "react";
import { apiRequest } from "../../../shared/api/http";

export function useStudentDashboard(userId) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchDashboard() {
      setLoading(true);
      setError("");
      try {
        const payload = await apiRequest("/student/dashboard");
        if (!ignore) {
          setDashboard(payload);
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
      fetchDashboard();
    }

    return () => {
      ignore = true;
    };
  }, [userId]);

  return { dashboard, loading, error };
}
