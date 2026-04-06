import { useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useStudentDashboard } from "../hooks/useStudentDashboard";

const JOINED_STATUSES = new Set(["APPROVED"]);

function normalizeStatus(status) {
    return String(status || "").trim().toUpperCase();
}

function formatStatus(status) {
    const normalized = normalizeStatus(status);
    switch (normalized) {
        case "APPROVED":
            return "Đã tham gia";
        case "REJECTED":
            return "Bị từ chối";
        default:
            return "Đang xử lý";
    }
}

function parseUiDateTime(value) {
    if (!value || typeof value !== "string") {
        return null;
    }

    const [datePart, timePart = "00:00"] = value.trim().split(" ");
    const [dd, mm, yyyy] = datePart.split("/").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    if (!dd || !mm || !yyyy) {
        return null;
    }

    return new Date(yyyy, mm - 1, dd, Number(hour) || 0, Number(minute) || 0);
}

function getStatusClass(status) {
    const normalized = normalizeStatus(status);
    if (normalized === "APPROVED") {
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300";
    }
    if (normalized === "REJECTED") {
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300";
    }
    return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300";
}

export default function StudentHistoryPanel() {
    const { user } = useAuth();
    const { dashboard, loading, error } = useStudentDashboard(user?.userId);

    const joinedEvents = useMemo(() => {
        const rows = Array.isArray(dashboard?.history) ? dashboard.history : [];

        return rows
            .filter((item) => JOINED_STATUSES.has(normalizeStatus(item.status)))
            .map((item) => ({ ...item, _createdDate: parseUiDateTime(item.createdAt) }))
            .sort((a, b) => {
                if (!a._createdDate && !b._createdDate) {
                    return 0;
                }
                if (!a._createdDate) {
                    return 1;
                }
                if (!b._createdDate) {
                    return -1;
                }
                return b._createdDate - a._createdDate;
            });
    }, [dashboard]);

    if (loading) {
        return <div className="page-state">Đang tải lịch sử hoạt động...</div>;
    }

    if (error) {
        return <div className="page-state error">Không thể tải lịch sử: {error}</div>;
    }

    return (
        <section className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-slate-800/50">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Lịch sử hoạt động</h2>
                    <p className="mt-1 text-sm text-slate-500">Hiển thị các sự kiện bạn đã tham gia.</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {joinedEvents.length} đã tham gia
                </span>
            </div>

            {joinedEvents.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                    Chưa có sự kiện đã tham gia.
                </p>
            ) : (
                <div className="space-y-3">
                    {joinedEvents.map((item) => (
                        <article
                            key={item.id}
                            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900 md:flex-row md:items-center md:justify-between"
                        >
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                                <p className="mt-1 text-xs text-slate-500">{item.createdAt || "Đang cập nhật thời gian"}</p>
                            </div>

                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(item.status)}`}>
                                {formatStatus(item.status)}
                            </span>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
