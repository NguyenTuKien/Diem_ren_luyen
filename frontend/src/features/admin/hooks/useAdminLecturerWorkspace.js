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

function toSearchValue(value) {
    return String(value ?? "").toLowerCase();
}

export function useAdminLecturerWorkspace() {
    const [options, setOptions] = useState({ faculties: [], classes: [] });
    const [allRows, setAllRows] = useState([]);
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
                const [optionsData, listData, statsData] = await Promise.all([
                    apiRequest("/v1/admin/lecturers/options"),
                    apiRequest("/v1/admin/lecturers"),
                    apiRequest("/v1/admin/lecturers/stats"),
                ]);

                const nextRows = listData.lecturers || [];
                setOptions(optionsData || { faculties: [], classes: [] });
                setAllRows(nextRows);
                setStats(statsData || EMPTY_STATS);
            } catch (error) {
                setFlash({ type: "error", message: error.message });
            } finally {
                if (!silent) {
                    setLoading(false);
                }
            }
        },
        [],
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

    const rows = useMemo(() => {
        const keyword = filters.keyword.trim().toLowerCase();
        return allRows.filter((row) => {
            if (filters.facultyId && String(row.facultyId ?? "") !== String(filters.facultyId)) {
                return false;
            }
            if (filters.status && String(row.status ?? "") !== String(filters.status)) {
                return false;
            }
            if (!keyword) {
                return true;
            }

            const classCodesText = Array.isArray(row.classCodes) ? row.classCodes.join(" ") : "";
            const searchable = [
                row.fullName,
                row.lecturerCode,
                row.email,
                row.username,
                row.facultyName,
                classCodesText,
                row.createdAt,
            ]
                .map(toSearchValue)
                .join(" ");

            return searchable.includes(keyword);
        });
    }, [allRows, filters.facultyId, filters.keyword, filters.status]);

    useEffect(() => {
        setSelectedLecturerId((previous) => {
            if (previous && rows.some((row) => row.lecturerId === previous)) {
                return previous;
            }
            return rows[0]?.lecturerId ?? null;
        });
    }, [rows]);

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
        lecturers: rows,
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
        selectLecturer: setSelectedLecturerId,
        selectedLecturer,
    };
}
