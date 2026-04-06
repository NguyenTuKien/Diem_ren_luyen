import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useStudentEvents } from "../hooks/useStudentEvents";

export default function StudentEventsPanel() {
  const { user } = useAuth();
  const { events, loading, error } = useStudentEvents(user?.userId);
  const [selectedEvent, setSelectedEvent] = useState(null);

  if (loading) {
    return <div className="p-6 text-slate-500">Đang tải sự kiện...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Lỗi: {error}</div>;
  }

  // Sắp xếp các sự kiện mới nhất (startTime giảm dần hoặc tang dan)
  // Backend đang trả về time asc (những sự kiện gần nhất trước). 
  // Để render "mới nhất" lên trên tuỳ chỉnh theo ý user
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(b.startTime) - new Date(a.startTime);
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 w-full overflow-hidden flex flex-col h-[calc(100vh-100px)]">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700/50 shrink-0">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sự kiện sắp tới</h2>
        <p className="text-sm text-slate-500 mt-1">Danh sách các sự kiện được sắp xếp mới nhất từ trên xuống.</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {sortedEvents.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            Chưa có sự kiện sắp tới.
          </div>
        ) : (
          <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-xl">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Tên sự kiện</th>
                  <th className="px-4 py-3 font-semibold">Thời gian bắt đầu</th>
                  <th className="px-4 py-3 font-semibold">Địa điểm</th>
                  <th className="px-4 py-3 font-semibold text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                {sortedEvents.map((event) => (
                  <tr 
                    key={event.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 max-w-[300px] truncate" title={event.title}>
                      {event.title}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {event.startTime}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-[200px] truncate" title={event.location}>
                      {event.location || "Đang cập nhật"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        className="text-primary hover:underline font-medium text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                  {selectedEvent.title}
                </h3>
                <p className="text-sm text-primary font-medium flex items-center gap-1 mt-2">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  Bắt đầu: {selectedEvent.startTime}
                </p>
              </div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 text-sm text-slate-600 dark:text-slate-300 space-y-4">
              <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="material-symbols-outlined text-slate-400">location_on</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 mb-0.5">Địa điểm tổ chức</p>
                  <p>{selectedEvent.location || "Chưa có thông tin cập nhật"}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Mô tả sự kiện</h4>
                <div className="whitespace-pre-wrap rounded-lg bg-slate-50 dark:bg-slate-800/30 p-4 border border-slate-100 dark:border-slate-800/50">
                  {selectedEvent.description || "Chưa có thông tin mô tả chi tiết."}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
              <button 
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-semibold rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
