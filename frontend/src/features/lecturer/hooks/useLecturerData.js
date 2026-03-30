import { useState, useCallback, useEffect } from "react";
import { apiRequest } from "../../../shared/api/http";

export function useLecturerData(userId, filters) {
  const [options, setOptions] = useState({ faculties: [], classes: [] });
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({
    totalStudents: 0,
    activeStudents: 0,
    lockedStudents: 0,
    monitorStudents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState({ type: "", message: "" });

  const loadOptions = useCallback(async () => {
    if (!userId) return null;
    const data = await apiRequest(`/lecturer/students/options?lecturerId=${userId}`);
    setOptions(data);
    return data;
  }, [userId]);

  const loadStudents = useCallback(async () => {
    if (!userId) return;
    const params = new URLSearchParams();
    params.set("lecturerId", userId);

    if (filters.keyword.trim()) params.set("keyword", filters.keyword.trim());
    if (filters.facultyId) params.set("facultyId", filters.facultyId);
    if (filters.classId) params.set("classId", filters.classId);
    if (filters.status) params.set("status", filters.status);

    const data = await apiRequest(`/lecturer/students?${params.toString()}`);
    setRows(data.students || []);
    setSummary({
      totalStudents: data.totalStudents || 0,
      activeStudents: data.activeStudents || 0,
      lockedStudents: data.lockedStudents || 0,
      monitorStudents: data.monitorStudents || 0,
    });
  }, [filters.classId, filters.facultyId, filters.keyword, filters.status, userId]);

  useEffect(() => {
    let ignore = false;

    async function bootstrap() {
      setLoading(true);
      setFlash({ type: "", message: "" });
      try {
        await loadOptions();
        await loadStudents();
      } catch (err) {
        if (!ignore) setFlash({ type: "error", message: err.message });
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (userId) bootstrap();

    return () => { ignore = true; };
  }, [loadOptions, loadStudents, userId]);

  return { options, rows, summary, loading, flash, setFlash, loadStudents };
}
