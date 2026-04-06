import { useAuth } from "../../../context/AuthContext";
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
  const { attendance, loading, error } = useStudentAttendance(user?.userId);

  if (loading) {
    return <div className="p-6 text-slate-500">Đang tải lịch sử tham gia...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Lỗi: {error}</div>;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 p-6 w-full max-w-4xl">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-700/50 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sự kiện/Hoạt động đã tham gia</h2>
          <p className="text-sm text-slate-500 mt-1">Danh sách các sự kiện bạn đã check-in thành công.</p>
        </div>
        <div className="flex items-center justify-center size-10 rounded-full bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
          <span className="material-symbols-outlined">how_to_reg</span>
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
            const badge = getEventBadge(event.checkinTime);
            return (
              <div key={event.id} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl transition-colors">
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
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      <span className="truncate max-w-[200px]">{event.location || "Không xác định"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>Đã check-in</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
