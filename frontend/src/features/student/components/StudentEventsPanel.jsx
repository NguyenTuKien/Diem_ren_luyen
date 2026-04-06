import { useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useStudentDashboard } from "../hooks/useStudentDashboard";

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

function getEventBadge(startTime) {
    if (!startTime) {
        return { day: "--", month: "TH--" };
    }

    const [datePart] = startTime.split(" ");
    const [day, month] = datePart.split("/");
    const monthNumber = Number(month);

    return {
        day: day || "--",
        month: Number.isNaN(monthNumber) ? "TH--" : `TH${monthNumber}`,
    };
}

export default function StudentEventsPanel() {
    const { user } = useAuth();
    const { dashboard, loading, error } = useStudentDashboard(user?.userId);

    const upcomingEvents = useMemo(() => {
        const rows = Array.isArray(dashboard?.upcomingEvents) ? dashboard.upcomingEvents : [];
        const now = new Date();

        return rows
            .map((event) => ({ ...event, _startDate: parseUiDateTime(event.startTime) }))
            .filter((event) => !event._startDate || event._startDate >= now)
            .sort((a, b) => {
                if (!a._startDate && !b._startDate) {
                    return 0;
                }
                if (!a._startDate) {
                    return 1;
                }
                if (!b._startDate) {
                    return -1;
                }
                return a._startDate - b._startDate;
            });
    }, [dashboard]);

    if (loading) {
        return <div className="page-state">Đang tải danh sách sự kiện sắp tới...</div>;
    }

    if (error) {
        return <div className="page-state error">Không thể tải sự kiện: {error}</div>;
    }

    return (
        <section className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-slate-800/50">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sự kiện sắp tới</h2>
                    <p className="mt-1 text-sm text-slate-500">Chỉ hiển thị các sự kiện chưa diễn ra.</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {upcomingEvents.length} sự kiện
                </span>
            </div>

            {upcomingEvents.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                    Hiện chưa có sự kiện sắp tới.
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {upcomingEvents.map((event) => {
                        const badge = getEventBadge(event.startTime);
                        return (
                            <article
                                key={event.id}
                                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900"
                            >
                                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <span className="text-[11px] font-semibold">{badge.month}</span>
                                    <strong className="text-lg leading-none">{badge.day}</strong>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{event.title}</h3>
                                    <p className="mt-1 text-xs text-slate-500">{event.startTime || "Đang cập nhật thời gian"}</p>
                                    <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-600 dark:text-slate-300">
                                        <span className="material-symbols-outlined text-sm">location_on</span>
                                        {event.location || "Đang cập nhật địa điểm"}
                                    </p>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
