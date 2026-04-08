const SUMMARY_CARD_CONFIG = [
  {
    id: "events",
    label: "Tổng sự kiện",
    valueKey: "totalEvents",
    icon: "event",
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    id: "students",
    label: "Sinh viên tham gia",
    valueKey: "participatingStudents",
    icon: "groups",
    color: "text-green-600",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  {
    id: "pending",
    label: "Minh chứng chờ duyệt",
    valueKey: "pendingEvidence",
    icon: "assignment_late",
    color: "text-amber-600",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
  {
    id: "notice",
    label: "Thông báo mới",
    valueKey: "newNotifications",
    icon: "chat_bubble",
    color: "text-violet-600",
    bg: "bg-violet-100 dark:bg-violet-900/30",
  },
];

const SCORE_DISTRIBUTION_META = [
  { key: "excellent", label: "Xuất sắc", color: "bg-primary" },
  { key: "good", label: "Tốt", color: "bg-blue-500" },
  { key: "fair", label: "Khá", color: "bg-amber-500" },
  { key: "average", label: "Trung bình", color: "bg-slate-300" },
];

const EVENT_ICON_META = [
  {
    icon: "rocket_launch",
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  {
    icon: "volunteer_activism",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    icon: "sports_basketball",
    iconColor: "text-orange-600",
    iconBg: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    icon: "event_available",
    iconColor: "text-sky-600",
    iconBg: "bg-sky-50 dark:bg-sky-900/20",
  },
  {
    icon: "campaign",
    iconColor: "text-pink-600",
    iconBg: "bg-pink-50 dark:bg-pink-900/20",
  },
];

function formatNumber(value) {
  const safe = Number(value);
  return new Intl.NumberFormat("vi-VN").format(Number.isFinite(safe) ? safe : 0);
}

function formatPercent(value) {
  const safe = Number(value);
  if (!Number.isFinite(safe)) {
    return "0%";
  }
  const rounded = Math.round(safe * 10) / 10;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}%`;
}

function normalizeDistribution(summary) {
  const rawItems = Array.isArray(summary?.scoreDistribution) ? summary.scoreDistribution : [];
  const byKey = rawItems.reduce((acc, item) => {
    if (item?.key) {
      acc[item.key] = Number(item.percentage) || 0;
    }
    return acc;
  }, {});

  return SCORE_DISTRIBUTION_META.map((meta) => ({
    ...meta,
    percentage: byKey[meta.key] ?? 0,
  }));
}

export default function LecturerDashboardOverview({ summary, onCreateEvent, loadingSummary = false }) {
  const resolvedSummary = {
    totalEvents: summary?.totalEvents ?? 0,
    participatingStudents: summary?.participatingStudents ?? 0,
    pendingEvidence: summary?.pendingEvidence ?? 0,
    newNotifications: summary?.newNotifications ?? 0,
  };
  const passRate = Number.isFinite(Number(summary?.passRate)) ? Number(summary.passRate) : 0;
  const normalizedPassRate = Math.max(0, Math.min(100, passRate));
  const scoreDistribution = normalizeDistribution(summary);
  const upcomingEvents = Array.isArray(summary?.upcomingEvents) ? summary.upcomingEvents : [];

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {SUMMARY_CARD_CONFIG.map((card) => (
          <article
            key={card.id}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg} ${card.color}`}>
              <span className="material-symbols-outlined">{card.icon}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatNumber(resolvedSummary[card.valueKey])}
              </h3>
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
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(#d23232 ${normalizedPassRate}%, #e2e8f0 ${normalizedPassRate}% 100%)`,
                }}
              />
              <div className="absolute inset-4 rounded-full bg-white dark:bg-slate-900" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {formatPercent(normalizedPassRate)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Đạt yêu cầu</span>
              </div>
            </div>

            <div className="w-full space-y-4">
              {scoreDistribution.map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {formatPercent(item.percentage)}
                  </span>
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
              onClick={onCreateEvent}
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
                {loadingSummary ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <tr key={`loading-event-${index}`} className="animate-pulse">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
                          <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="mb-2 h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                        <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
                      </td>
                      <td className="py-4">
                        <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-700" />
                      </td>
                      <td className="py-4">
                        <div className="h-3 w-12 rounded bg-slate-200 dark:bg-slate-700" />
                      </td>
                      <td className="py-4 text-right">
                        <div className="ml-auto h-6 w-12 rounded bg-slate-200 dark:bg-slate-700" />
                      </td>
                    </tr>
                  ))
                ) : upcomingEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-slate-500">
                      Chưa có sự kiện sắp diễn ra.
                    </td>
                  </tr>
                ) : (
                  upcomingEvents.map((event, index) => {
                    const iconMeta = EVENT_ICON_META[index % EVENT_ICON_META.length];
                    return (
                      <tr key={event.id ?? `${event.title}-${index}`} className="group">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconMeta.iconBg} ${iconMeta.iconColor}`}>
                              <span className="material-symbols-outlined">{iconMeta.icon}</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {event.title || "Sự kiện chưa đặt tên"}
                            </p>
                          </div>
                        </td>
                        <td className="py-4">
                          <p className="text-sm text-slate-700 dark:text-slate-200">{event.dateLabel || "--/--/----"}</p>
                          <p className="text-xs text-slate-500">{event.timeLabel || "--:-- - --:--"}</p>
                        </td>
                        <td className="py-4 text-sm text-slate-700 dark:text-slate-200">{event.location || "Chưa cập nhật"}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{formatNumber(event.attendeeCount)}</span>
                            <span className="text-slate-400">/--</span>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            type="button"
                            className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            #{event.id ?? "--"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}
