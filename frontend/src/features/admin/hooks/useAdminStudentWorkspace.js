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

function toSearchValue(value) {
    return String(value ?? "").toLowerCase();
}

export function useAdminStudentWorkspace() {
    const [options, setOptions] = useState({ faculties: [], classes: [] });
    const [allRows, setAllRows] = useState([]);
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
                const [optionsData, listData, statsData] = await Promise.all([
                    apiRequest("/v1/admin/students/options"),
                    apiRequest("/v1/admin/students"),
                    apiRequest("/v1/admin/students/stats"),
                ]);

                const nextRows = listData.students || [];
                setOptions(optionsData || { faculties: [], classes: [] });
                setAllRows(nextRows);
                setStats(statsData || EMPTY_STATS);
            } catch (error) {
                setFlash({ type: "error", message: error.message });
            } finally {
                if (!silent) setLoading(false);
            }
        },
        [],
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

    const rows = useMemo(() => {
        const keyword = filters.keyword.trim().toLowerCase();
        return allRows.filter((row) => {
            if (filters.facultyId && String(row.facultyId ?? "") !== String(filters.facultyId)) {
                return false;
            }
            if (filters.classId && String(row.classId ?? "") !== String(filters.classId)) {
                return false;
            }
            if (filters.status && String(row.status ?? "") !== String(filters.status)) {
                return false;
            }
            if (!keyword) {
                return true;
            }

            const searchable = [
                row.fullName,
                row.studentCode,
                row.email,
                row.username,
                row.classCode,
                row.facultyName,
                row.role,
                row.createdAt,
            ]
                .map(toSearchValue)
                .join(" ");

            return searchable.includes(keyword);
        });
    }, [allRows, filters.classId, filters.facultyId, filters.keyword, filters.status]);

    useEffect(() => {
        setSelectedStudentId((previous) => {
            if (previous && rows.some((row) => row.studentId === previous)) {
                return previous;
            }
            return rows[0]?.studentId ?? null;
        });
    }, [rows]);

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
