import { useState, useCallback, useEffect } from "react";
import { apiRequest } from "../../../shared/api/http";

export function useLecturerData(lecturerId, filters) {
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
    if (!lecturerId) return null;
    const data = await apiRequest(`/lecturer/students/options?lecturerId=${lecturerId}`);
    setOptions(data);
    return data;
  }, [lecturerId]);

  const loadStudents = useCallback(async () => {
    if (!lecturerId) return;
    const params = new URLSearchParams();
    params.set("lecturerId", lecturerId);

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
  }, [filters.classId, filters.facultyId, filters.keyword, filters.status, lecturerId]);

  useEffect(() => {
    let ignore = false;

    if (!lecturerId) {
      setLoading(false);
      setFlash({
        type: "error",
        message: "Không xác định được định danh nội bộ của giảng viên. Vui lòng đăng nhập lại.",
      });
      return () => {
        ignore = true;
      };
    }

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

    bootstrap();

    return () => { ignore = true; };
  }, [loadOptions, loadStudents, lecturerId]);

  return { options, rows, summary, loading, flash, setFlash, loadStudents };
}
