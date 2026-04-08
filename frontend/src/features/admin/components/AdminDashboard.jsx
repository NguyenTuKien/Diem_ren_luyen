const STATUS_BADGES = {
  ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  LOCKED: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  DELETED: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

function formatNumber(value) {
  return new Intl.NumberFormat("vi-VN").format(Number(value) || 0);
}

function StatCard({ label, value, icon, hint, tone }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</h3>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
      </div>
    </article>
  );
}

export default function AdminDashboard({ workspace, onNavigate }) {
  const { lecturerWorkspace, studentWorkspace } = workspace;
  const lecturerStats = lecturerWorkspace.stats;
  const studentStats = studentWorkspace.stats;
  const lecturerRows = lecturerWorkspace.rows;
  const studentRows = studentWorkspace.rows;
  const flash = lecturerWorkspace.flash.message ? lecturerWorkspace.flash : studentWorkspace.flash;
  const recentLecturers = lecturerStats.recentLecturers || lecturerRows.slice(0, 5);
  const recentStudents = studentStats.recentStudents || studentRows.slice(0, 5);
  const facultyBreakdown = lecturerStats.facultyBreakdown || [];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-rose-100 bg-gradient-to-r from-white via-rose-50 to-orange-50 p-6 text-slate-900 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-1.5 text-sm font-bold uppercase tracking-[0.2em] text-primary">
              <span className="material-symbols-outlined text-base">admin_panel_settings</span>
              Trang quản lý của admin
            </span>
          </div>

          <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2 lg:grid-cols-3">
            <button
              type="button"
              onClick={() => onNavigate?.("lecturers")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-bold text-slate-900 transition-transform hover:-translate-y-0.5 hover:border-primary/30"
            >
              <span className="material-symbols-outlined text-lg">group</span>
              Xem giảng viên
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.("students")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-bold text-slate-900 transition-transform hover:-translate-y-0.5 hover:border-primary/30"
            >
              <span className="material-symbols-outlined text-lg">groups</span>
              Xem sinh viên
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.("statistics")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-bold text-slate-900 transition-transform hover:-translate-y-0.5 hover:border-primary/30"
            >
              <span className="material-symbols-outlined text-lg">query_stats</span>
              Thống kê
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.("createLecturer")}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-base font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined text-lg">person_add</span>
              Thêm giảng viên
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.("createStudent")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-bold text-slate-900 transition-transform hover:-translate-y-0.5 hover:border-primary/30"
            >
              <span className="material-symbols-outlined text-lg">group_add</span>
              Thêm sinh viên
            </button>
          </div>
        </div>

        {flash.message ? (
          <div className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${flash.type === "error" ? "border-rose-300 bg-rose-50 text-rose-700" : flash.type === "success" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-amber-300 bg-amber-50 text-amber-700"}`}>
            {flash.message}
          </div>
        ) : null}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tổng giảng viên"
          value={formatNumber(lecturerStats.totalLecturers)}
          icon="badge"
          hint="Tài khoản đang được quản lý"
          tone="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <StatCard
          label="Đang hoạt động"
          value={formatNumber(lecturerStats.activeLecturers)}
          icon="verified"
          hint="Sẵn sàng phân công nhiệm vụ"
          tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
        />
        <StatCard
          label="Bị khóa"
          value={formatNumber(lecturerStats.lockedLecturers)}
          icon="lock"
          hint="Cần kiểm tra quyền truy cập"
          tone="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
        />
        <StatCard
          label="Khoa liên quan"
          value={formatNumber(lecturerStats.totalFaculties + (studentStats.totalFaculties || 0))}
          icon="account_tree"
          hint="Tổng hợp theo giảng viên và sinh viên"
          tone="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Giảng viên gần đây</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Danh sách được cập nhật từ backend admin.</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.("lecturers")}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-300"
            >
              Xem toàn bộ
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                <tr>
                  <th className="pb-4">Giảng viên</th>
                  <th className="pb-4">Khoa</th>
                  <th className="pb-4">Trạng thái</th>
                  <th className="pb-4 text-right">Lớp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentLecturers.length > 0 ? recentLecturers.map((lecturer) => (
                  <tr key={lecturer.lecturerId} className="group">
                    <td className="py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{lecturer.fullName}</p>
                        <p className="text-xs text-slate-500">{lecturer.lecturerCode} · {lecturer.email}</p>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-slate-700 dark:text-slate-200">
                      {lecturer.facultyName || "Chưa gán khoa"}
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_BADGES[lecturer.status] || "bg-slate-100 text-slate-600"}`}>
                        {lecturer.status}
                      </span>
                    </td>
                    <td className="py-4 text-right text-sm font-bold text-slate-900 dark:text-slate-100">{lecturer.classCount ?? 0}</td>
                  </tr>
                )) : (
                  <tr>
                    <td className="py-8 text-sm text-slate-500" colSpan={4}>
                      Chưa có dữ liệu giảng viên.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Phân bố theo khoa</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Số giảng viên và lớp đang gắn theo từng khoa.</p>
          </div>

          <div className="space-y-4">
            {facultyBreakdown.length > 0 ? facultyBreakdown.map((item) => {
              const percentage = lecturerStats.totalLecturers > 0
                ? Math.max(8, Math.round((item.lecturerCount / lecturerStats.totalLecturers) * 100))
                : 0;
              return (
                <div key={item.facultyId} className="space-y-2">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{item.facultyName}</p>
                      <p className="text-xs text-slate-500">{item.facultyCode}</p>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{item.lecturerCount} GV</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-2 rounded-full bg-gradient-to-r from-primary to-rose-500" style={{ width: `${percentage}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{item.classCount} lớp</span>
                    <span>{percentage}%</span>
                  </div>
                </div>
              );
            }) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700">
                Chưa có thống kê theo khoa.
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Sinh viên gần đây</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Bản ghi từ khu quản trị sinh viên.</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.("students")}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-300"
            >
              Xem toàn bộ
            </button>
          </div>

          <div className="space-y-4">
            {recentStudents.length > 0 ? recentStudents.map((student) => (
              <div key={student.studentId} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{student.fullName}</p>
                    <p className="text-sm text-slate-500">{student.studentCode}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_BADGES[student.status] || "bg-slate-100 text-slate-600"}`}>
                    {student.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-500">{student.classCode || "Chưa có lớp"} · {student.facultyName || "Chưa có khoa"}</p>
                <p className="mt-1 text-xs text-slate-400">{student.createdAt || "--"}</p>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-700">
                Chưa có sinh viên nào.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Thống kê sinh viên</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Tổng quan nhanh về tài khoản sinh viên.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Tổng sinh viên" value={formatNumber(studentStats.totalStudents)} icon="school" tone="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100" />
            <StatCard label="Đang hoạt động" value={formatNumber(studentStats.activeStudents)} icon="verified" tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" />
            <StatCard label="Monitor" value={formatNumber(studentStats.monitorStudents)} icon="flag" tone="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" />
            <StatCard label="Bị khóa" value={formatNumber(studentStats.lockedStudents)} icon="lock" tone="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" />
          </div>
        </article>
      </section>
    </div>
  );
}
