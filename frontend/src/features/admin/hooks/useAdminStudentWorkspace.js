import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../../shared/api/http";

const DEFAULT_FILTERS = {
    keyword: "",
    facultyId: "",
    classId: "",
    status: "",
};

const EMPTY_STATS = {
    totalStudents: 0,
    activeStudents: 0,
    lockedStudents: 0,
    deletedStudents: 0,
    monitorStudents: 0,
    totalFaculties: 0,
    totalClasses: 0,
    facultyBreakdown: [],
    classBreakdown: [],
    recentStudents: [],
};

const EMPTY_FLASH = { type: "", message: "" };

export function useAdminStudentWorkspace() {
    const [options, setOptions] = useState({ faculties: [], classes: [] });
    const [rows, setRows] = useState([]);
    const [stats, setStats] = useState(EMPTY_STATS);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [flash, setFlash] = useState(EMPTY_FLASH);
    const [selectedStudentId, setSelectedStudentId] = useState(null);

    useEffect(() => {
        if (!flash.message) {
            return undefined;
        }

        const timeout = window.setTimeout(() => {
            setFlash(EMPTY_FLASH);
        }, flash.type === "error" ? 6000 : 3000);

        return () => window.clearTimeout(timeout);
    }, [flash]);

    const loadWorkspace = useCallback(
        async ({ silent = false } = {}) => {
            if (!silent) {
                setLoading(true);
                setFlash(EMPTY_FLASH);
            }

            try {
                const params = new URLSearchParams();
                if (filters.keyword.trim()) params.set("keyword", filters.keyword.trim());
                if (filters.facultyId) params.set("facultyId", filters.facultyId);
                if (filters.classId) params.set("classId", filters.classId);
                if (filters.status) params.set("status", filters.status);

                const [optionsData, listData, statsData] = await Promise.all([
                    apiRequest("/v1/admin/students/options"),
                    apiRequest(`/v1/admin/students${params.toString() ? `?${params.toString()}` : ""}`),
                    apiRequest("/v1/admin/students/stats"),
                ]);

                const nextRows = listData.students || [];
                setOptions(optionsData || { faculties: [], classes: [] });
                setRows(nextRows);
                setStats(statsData || EMPTY_STATS);
                setSelectedStudentId((previous) => {
                    if (previous && nextRows.some((row) => row.studentId === previous)) return previous;
                    return nextRows[0]?.studentId ?? null;
                });
            } catch (error) {
                setFlash({ type: "error", message: error.message });
            } finally {
                if (!silent) setLoading(false);
            }
        },
        [filters.classId, filters.facultyId, filters.keyword, filters.status],
    );

    useEffect(() => {
        let ignore = false;

        (async () => {
            await loadWorkspace();
            if (!ignore) setLoading(false);
        })();

        return () => {
            ignore = true;
        };
    }, [loadWorkspace]);

    const refresh = useCallback(async () => {
        await loadWorkspace({ silent: true });
    }, [loadWorkspace]);

    const createStudent = useCallback(
        async (payload) => {
            setBusy(true);
            try {
                const result = await apiRequest("/v1/admin/students", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                await loadWorkspace({ silent: true });
                setFlash({ type: "success", message: `Đã thêm sinh viên ${result.fullName}.` });
                return result;
            } catch (error) {
                setFlash({ type: "error", message: error.message });
                throw error;
            } finally {
                setBusy(false);
            }
        },
        [loadWorkspace],
    );

    const updateStudent = useCallback(
        async (studentId, payload) => {
            setBusy(true);
            try {
                const result = await apiRequest(`/v1/admin/students/${studentId}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                });

                await loadWorkspace({ silent: true });
                setFlash({ type: "success", message: `Đã cập nhật sinh viên ${result.fullName}.` });
                return result;
            } catch (error) {
                setFlash({ type: "error", message: error.message });
                throw error;
            } finally {
                setBusy(false);
            }
        },
        [loadWorkspace],
    );

    const deleteStudent = useCallback(
        async (studentId) => {
            setBusy(true);
            try {
                await apiRequest(`/v1/admin/students/${studentId}`, {
                    method: "DELETE",
                });
                await loadWorkspace({ silent: true });
                setFlash({ type: "success", message: "Đã xóa sinh viên." });
            } catch (error) {
                setFlash({ type: "error", message: error.message });
                throw error;
            } finally {
                setBusy(false);
            }
        },
        [loadWorkspace],
    );

    const selectedStudent = useMemo(
        () => rows.find((row) => row.studentId === selectedStudentId) || rows[0] || null,
        [rows, selectedStudentId],
    );

    return {
        options,
        rows,
        stats,
        filters,
        setFilters,
        loading,
        busy,
        flash,
        setFlash,
        refresh,
        createStudent,
        updateStudent,
        deleteStudent,
        selectedStudentId,
        setSelectedStudentId,
        selectedStudent,
    };
}