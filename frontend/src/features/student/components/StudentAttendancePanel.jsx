import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useCurrentSemester } from "../../../hooks/useCurrentSemester";
import { useStudentAttendance } from "../hooks/useStudentAttendance";

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

export default function StudentAttendancePanel() {
  const { user } = useAuth();
  const { semesters, activeSemesterId, loading: semesterLoading, error: semesterError } = useCurrentSemester();
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!selectedSemesterId && activeSemesterId) {
      setSelectedSemesterId(activeSemesterId);
    }
  }, [activeSemesterId, selectedSemesterId]);

  const { attendance, pagination, loading, error } = useStudentAttendance(
    user?.userId,
    selectedSemesterId,
    page,
    10,
  );

  if (semesterLoading || loading) {
    return <div className="p-6 text-slate-500">Đang tải lịch sử tham gia...</div>;
  }

  if (semesterError || error) {
    return <div className="p-6 text-red-500">Lỗi: {semesterError || error}</div>;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 p-6 w-full max-w-4xl">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-700/50 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sự kiện/Hoạt động đã tham gia</h2>
          <p className="text-sm text-slate-500 mt-1">Dữ liệu lấy từ API lịch sử hoạt động chi tiết theo học kỳ.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
            <span className="material-symbols-outlined text-base">calendar_today</span>
            <select
              className="bg-transparent outline-none"
              value={selectedSemesterId || ""}
              onChange={(event) => {
                setSelectedSemesterId(Number(event.target.value));
                setPage(0);
              }}
            >
              {semesters.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-center size-10 rounded-full bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
            <span className="material-symbols-outlined">how_to_reg</span>
          </div>
        </div>
      </div>

      {attendance.length === 0 ? (
        <div className="py-16 text-center">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
            <span className="material-symbols-outlined text-3xl">event_busy</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium pb-1">Chưa có dữ liệu</p>
          <p className="text-sm text-slate-500">Bạn chưa tham gia sự kiện nào gần đây.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {attendance.map((event) => {
            const badge = getEventBadge(event.activityTime);
            const status = String(event.status || "PENDING").toUpperCase();
            const statusColor =
              status === "APPROVED"
                ? "text-green-600 dark:text-green-400"
                : status === "REJECTED"
                  ? "text-red-600 dark:text-red-400"
                  : "text-amber-600 dark:text-amber-400";
            return (
              <div key={event.recordId} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl transition-colors">
                <div className="flex-shrink-0 flex items-center justify-center w-16 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                  <div className="text-center">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">{badge.month}</span>
                    <strong className="block text-xl text-slate-900 dark:text-white leading-none">{badge.day}</strong>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base truncate mb-1">
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">school</span>
                      <span className="truncate max-w-[200px]">{event.semesterName || "Không xác định học kỳ"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className={`material-symbols-outlined text-[14px] ${statusColor}`}>bolt</span>
                      <span className={statusColor}>+{event.points || 0} điểm</span>
                    </div>
                    <div className={`flex items-center gap-1.5 font-medium ${statusColor}`}>
                      <span className="material-symbols-outlined text-[14px]">info</span>
                      <span>{status}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-50"
            disabled={page <= 0}
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          >
            Trước
          </button>
          <span className="px-2 text-sm text-slate-600 dark:text-slate-300">
            Trang {pagination.page + 1}/{Math.max(pagination.totalPages, 1)}
          </span>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-50"
            disabled={pagination.page + 1 >= pagination.totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
