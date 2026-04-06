import { useState, useEffect } from "react";
import { apiRequest } from "../../../shared/api/http";

export function useMonitorData(monitorUserId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchMembers() {
      setLoading(true);
      setError("");
      try {
        const payload = await apiRequest(`/monitor/class-members?monitorUserId=${monitorUserId}`);
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

    if (monitorUserId) {
      fetchMembers();
    }

    return () => {
      ignore = true;
    };
  }, [monitorUserId]);

  return { data, loading, error };
}
