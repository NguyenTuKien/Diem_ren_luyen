const SUMMARY_CARDS = [
  {
    id: "events",
    label: "Tổng sự kiện",
    value: "24",
    icon: "event",
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    id: "students",
    label: "Sinh viên tham gia",
    value: "1,250",
    icon: "groups",
    color: "text-green-600",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  {
    id: "pending",
    label: "Minh chứng chờ duyệt",
    value: "15",
    icon: "assignment_late",
    color: "text-amber-600",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
  {
    id: "notice",
    label: "Thông báo mới",
    value: "5",
    icon: "chat_bubble",
    color: "text-violet-600",
    bg: "bg-violet-100 dark:bg-violet-900/30",
  },
];

const UPCOMING_EVENTS = [
  {
    id: 1,
    name: "Hội thảo AI và Future",
    icon: "rocket_launch",
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-50 dark:bg-indigo-900/20",
    date: "24/12/2023",
    time: "08:00 - 11:30",
    location: "Hội trường A",
    attendee: "180",
    capacity: "200",
  },
  {
    id: 2,
    name: "Hiến máu nhân đạo",
    icon: "volunteer_activism",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
    date: "26/12/2023",
    time: "07:00 - 16:00",
    location: "Sân trường",
    attendee: "320",
    capacity: "500",
  },
  {
    id: 3,
    name: "Giải bóng rổ sinh viên",
    icon: "sports_basketball",
    iconColor: "text-orange-600",
    iconBg: "bg-orange-50 dark:bg-orange-900/20",
    date: "28/12/2023",
    time: "17:00 - 21:00",
    location: "Nhà thi đấu",
    attendee: "50",
    capacity: "50",
  },
];

const SCORE_DISTRIBUTION = [
  { id: "excellent", label: "Xuất sắc", value: "15%", color: "bg-primary" },
  { id: "good", label: "Tốt", value: "45%", color: "bg-blue-500" },
  { id: "fair", label: "Khá", value: "25%", color: "bg-amber-500" },
  { id: "average", label: "Trung bình", value: "15%", color: "bg-slate-300" },
];

export default function LecturerDashboardOverview() {
  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {SUMMARY_CARDS.map((card) => (
          <article
            key={card.id}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg} ${card.color}`}>
              <span className="material-symbols-outlined">{card.icon}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{card.value}</h3>
            </div>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Phân bố điểm rèn luyện</h3>
            <button type="button" className="text-sm font-semibold text-primary">
              Chi tiết
            </button>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative mb-8 h-48 w-48">
              <div className="absolute inset-0 rounded-full border-[16px] border-slate-100 dark:border-slate-800" />
              <div
                className="absolute inset-0 rotate-45 rounded-full border-[16px] border-primary"
                style={{ borderTopColor: "transparent", borderLeftColor: "transparent", borderRightColor: "transparent" }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">85%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Đạt yêu cầu</span>
              </div>
            </div>

            <div className="w-full space-y-4">
              {SCORE_DISTRIBUTION.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Sự kiện sắp diễn ra</h3>
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white"
            >
              Tạo sự kiện mới
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800">
                <tr>
                  <th className="pb-4">Sự kiện</th>
                  <th className="pb-4">Thời gian</th>
                  <th className="pb-4">Địa điểm</th>
                  <th className="pb-4">Số lượng</th>
                  <th className="pb-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {UPCOMING_EVENTS.map((event) => (
                  <tr key={event.id} className="group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${event.iconBg} ${event.iconColor}`}>
                          <span className="material-symbols-outlined">{event.icon}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{event.name}</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="text-sm text-slate-700 dark:text-slate-200">{event.date}</p>
                      <p className="text-xs text-slate-500">{event.time}</p>
                    </td>
                    <td className="py-4 text-sm text-slate-700 dark:text-slate-200">{event.location}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{event.attendee}</span>
                        <span className="text-slate-400">/{event.capacity}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-primary hover:text-white dark:bg-slate-800 dark:text-slate-300"
                        >
                          <span className="material-symbols-outlined text-base">qr_code</span>
                          Tạo QR
                        </button>
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}

