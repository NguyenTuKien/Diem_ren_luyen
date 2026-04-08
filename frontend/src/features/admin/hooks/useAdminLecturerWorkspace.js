import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../../shared/api/http";

const DEFAULT_FILTERS = {
    keyword: "",
    facultyId: "",
    status: "",
};

const EMPTY_STATS = {
    totalLecturers: 0,
    activeLecturers: 0,
    lockedLecturers: 0,
    deletedLecturers: 0,
    totalFaculties: 0,
    assignedClasses: 0,
    unassignedLecturers: 0,
    facultyBreakdown: [],
    recentLecturers: [],
};

const EMPTY_FLASH = { type: "", message: "" };

export function useAdminLecturerWorkspace() {
    const [options, setOptions] = useState({ faculties: [] });
    const [rows, setRows] = useState([]);
    const [stats, setStats] = useState(EMPTY_STATS);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [flash, setFlash] = useState(EMPTY_FLASH);
    const [selectedLecturerId, setSelectedLecturerId] = useState(null);

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

                if (filters.keyword.trim()) {
                    params.set("keyword", filters.keyword.trim());
                }
                if (filters.facultyId) {
                    params.set("facultyId", filters.facultyId);
                }
                if (filters.status) {
                    params.set("status", filters.status);
                }

                const [optionsData, listData, statsData] = await Promise.all([
                    apiRequest("/v1/admin/lecturers/options"),
                    apiRequest(`/v1/admin/lecturers${params.toString() ? `?${params.toString()}` : ""}`),
                    apiRequest("/v1/admin/lecturers/stats"),
                ]);

                const nextRows = listData.lecturers || [];
                setOptions(optionsData || { faculties: [] });
                setRows(nextRows);
                setStats(statsData || EMPTY_STATS);
                setSelectedLecturerId((previous) => {
                    if (previous && nextRows.some((row) => row.lecturerId === previous)) {
                        return previous;
                    }
                    return nextRows[0]?.lecturerId ?? null;
                });
            } catch (error) {
                setFlash({ type: "error", message: error.message });
            } finally {
                if (!silent) {
                    setLoading(false);
                }
            }
        },
        [filters.facultyId, filters.keyword, filters.status],
    );

    useEffect(() => {
        let ignore = false;

        (async () => {
            await loadWorkspace();
            if (ignore) {
                return;
            }
            setLoading(false);
        })();

        return () => {
            ignore = true;
        };
    }, [loadWorkspace]);

    const refresh = useCallback(async () => {
        await loadWorkspace({ silent: true });
    }, [loadWorkspace]);

    const createLecturer = useCallback(
        async (payload) => {
            setBusy(true);
            try {
                const result = await apiRequest("/v1/admin/lecturers", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });

                await loadWorkspace({ silent: true });
                setFlash({ type: "success", message: `Đã thêm giảng viên ${result.fullName}.` });
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

    const updateLecturer = useCallback(
        async (lecturerId, payload) => {
            setBusy(true);
            try {
                const result = await apiRequest(`/v1/admin/lecturers/${lecturerId}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                });

                await loadWorkspace({ silent: true });
                setFlash({ type: "success", message: `Đã cập nhật giảng viên ${result.fullName}.` });
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

    const deleteLecturer = useCallback(
        async (lecturerId) => {
            setBusy(true);
            try {
                await apiRequest(`/v1/admin/lecturers/${lecturerId}`, {
                    method: "DELETE",
                });

                await loadWorkspace({ silent: true });
                setFlash({ type: "success", message: "Đã xóa giảng viên." });
            } catch (error) {
                setFlash({ type: "error", message: error.message });
                throw error;
            } finally {
                setBusy(false);
            }
        },
        [loadWorkspace],
    );

    const selectedLecturer = useMemo(
        () => rows.find((row) => row.lecturerId === selectedLecturerId) || rows[0] || null,
        [rows, selectedLecturerId],
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
        createLecturer,
        updateLecturer,
        deleteLecturer,
        selectedLecturerId,
        setSelectedLecturerId,
        selectedLecturer,
    };
}