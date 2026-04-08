function StatCard({ label, value, icon, tone }) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{value}</p>
                </div>
            </div>
        </article>
    );
}

export default function AdminStudentStats({ studentWorkspace }) {
    const { stats } = studentWorkspace;
    const facultyBreakdown = stats.facultyBreakdown || [];
    const classBreakdown = stats.classBreakdown || [];

    return (
        <div className="space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Thống kê sinh viên</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">Bức tranh vận hành của sinh viên.</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">Tổng hợp số liệu sinh viên, monitor, khoa và lớp từ API admin sinh viên.</p>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Tổng sinh viên" value={stats.totalStudents ?? 0} icon="school" tone="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100" />
                <StatCard label="Hoạt động" value={stats.activeStudents ?? 0} icon="verified" tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" />
                <StatCard label="Monitor" value={stats.monitorStudents ?? 0} icon="flag" tone="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" />
                <StatCard label="Lớp đang quản lý" value={stats.totalClasses ?? 0} icon="groups" tone="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" />
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Phân bố theo khoa</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Số lượng sinh viên và monitor theo từng khoa.</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                            {stats.totalFaculties ?? 0} khoa
                        </span>
                    </div>

                    <div className="mt-6 space-y-4">
                        {facultyBreakdown.length > 0 ? facultyBreakdown.map((item) => {
                            const width = stats.totalStudents > 0 ? Math.max(8, Math.round((item.studentCount / stats.totalStudents) * 100)) : 0;
                            return (
                                <div key={item.facultyId} className="space-y-2">
                                    <div className="flex items-center justify-between gap-4 text-sm">
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-slate-100">{item.facultyName}</p>
                                            <p className="text-xs text-slate-500">{item.facultyCode}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900 dark:text-slate-100">{item.studentCount} sinh viên</p>
                                            <p className="text-xs text-slate-500">{item.monitorCount} monitor</p>
                                        </div>
                                    </div>
                                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                                        <div className="h-2 rounded-full bg-gradient-to-r from-primary to-rose-500" style={{ width: `${width}%` }} />
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-700">Chưa có phân bố theo khoa.</div>
                        )}
                    </div>
                </article>

                <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Lớp theo sinh viên</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Thống kê theo lớp và giảng viên phụ trách.</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                            {classBreakdown.length} lớp
                        </span>
                    </div>

                    <div className="mt-6 space-y-3">
                        {classBreakdown.length > 0 ? classBreakdown.map((item) => (
                            <div key={item.classId} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-slate-100">{item.classCode}</p>
                                        <p className="text-sm text-slate-500">{item.facultyName || "Chưa có khoa"}</p>
                                    </div>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                                        {item.studentCount} SV
                                    </span>
                                </div>
                                <p className="mt-3 text-sm text-slate-500">{item.lecturerName || "Chưa gán giảng viên"}</p>
                            </div>
                        )) : (
                            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-700">Chưa có dữ liệu lớp.</div>
                        )}
                    </div>
                </article>
            </section>
        </div>
    );
}