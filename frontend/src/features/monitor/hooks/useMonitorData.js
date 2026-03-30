import { useState, useEffect } from "react";
import { apiRequest } from "../../../shared/api/http";

export function useMonitorData(userId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchMembers() {
      setLoading(true);
      setError("");
      try {
        const payload = await apiRequest(`/monitor/class-members?monitorUserId=${userId}`);
        if (!ignore) {
          setData(payload);
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
      fetchMembers();
    }

    return () => {
      ignore = true;
    };
  }, [userId]);

  return { data, loading, error };
}
