import { useState, useEffect } from "react";
import { apiRequest } from "../../../shared/api/http";

export function useStudentEvents(userId) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchEvents() {
      setLoading(true);
      setError("");
      try {
        const payload = await apiRequest("/student/events");
        if (!ignore) {
          setEvents(payload || []);
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
      fetchEvents();
    }

    return () => {
      ignore = true;
    };
  }, [userId]);

  return { events, loading, error };
}
