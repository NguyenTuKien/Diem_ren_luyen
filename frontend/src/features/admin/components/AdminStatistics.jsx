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

const STATUS_STYLES = {
    ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    LOCKED: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    DELETED: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

export default function AdminStatistics({ lecturerWorkspace, studentWorkspace }) {
    const lecturerStats = lecturerWorkspace.stats;
    const studentStats = studentWorkspace.stats;
    const facultyBreakdown = lecturerStats.facultyBreakdown || [];
    const recentLecturers = lecturerStats.recentLecturers || [];
    const studentFacultyBreakdown = studentStats.facultyBreakdown || [];
    const recentStudents = studentStats.recentStudents || [];

    return (
        <div className="space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Thống kê</p>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Tổng giảng viên" value={lecturerStats.totalLecturers ?? 0} icon="badge" tone="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100" />
                <StatCard label="Tổng sinh viên" value={studentStats.totalStudents ?? 0} icon="school" tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" />
                <StatCard label="Lớp đã gán" value={studentStats.totalClasses ?? 0} icon="groups" tone="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" />
                <StatCard label="Monitor" value={studentStats.monitorStudents ?? 0} icon="flag" tone="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" />
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Phân bố theo khoa</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Mỗi thanh phản ánh tỷ lệ giảng viên của khoa đó.</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                            {lecturerStats.totalFaculties ?? 0} khoa
                        </span>
                    </div>

                    <div className="mt-6 space-y-4">
                        {facultyBreakdown.length > 0 ? facultyBreakdown.map((item) => {
                            const width = lecturerStats.totalLecturers > 0 ? Math.max(8, Math.round((item.lecturerCount / lecturerStats.totalLecturers) * 100)) : 0;
                            return (
                                <div key={item.facultyId} className="space-y-2">
                                    <div className="flex items-center justify-between gap-4 text-sm">
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-slate-100">{item.facultyName}</p>
                                            <p className="text-xs text-slate-500">{item.facultyCode}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900 dark:text-slate-100">{item.lecturerCount} giảng viên</p>
                                            <p className="text-xs text-slate-500">{item.classCount} lớp</p>
                                        </div>
                                    </div>
                                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                                        <div className="h-2 rounded-full bg-gradient-to-r from-primary to-rose-500" style={{ width: `${width}%` }} />
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-700">
                                Chưa có phân bố theo khoa.
                            </div>
                        )}
                    </div>
                </article>

                <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Giảng viên cập nhật gần đây</h2>
                    <div className="mt-5 space-y-4">
                        {recentLecturers.length > 0 ? recentLecturers.map((lecturer) => (
                            <div key={lecturer.lecturerId} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-slate-100">{lecturer.fullName}</p>
                                        <p className="text-sm text-slate-500">{lecturer.lecturerCode}</p>
                                    </div>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                                        {lecturer.status}
                                    </span>
                                </div>
                                <p className="mt-3 text-sm text-slate-500">{lecturer.email}</p>
                                <p className="mt-1 text-xs text-slate-400">{lecturer.createdAt || "--"}</p>
                            </div>
                        )) : (
                            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-700">
                                Chưa có giảng viên nào.
                            </div>
                        )}
                    </div>
                </article>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
                <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Phân bố sinh viên theo khoa</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Số lượng sinh viên và monitor theo từng khoa.</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                            {studentStats.totalFaculties ?? 0} khoa
                        </span>
                    </div>

                    <div className="mt-6 space-y-4">
                        {studentFacultyBreakdown.length > 0 ? studentFacultyBreakdown.map((item) => {
                            const width = studentStats.totalStudents > 0 ? Math.max(8, Math.round((item.studentCount / studentStats.totalStudents) * 100)) : 0;
                            return (
                                <div key={item.facultyId} className="space-y-2">
                                    <div className="flex items-center justify-between gap-4 text-sm">
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-slate-100">{item.facultyName}</p>
                                            <p className="text-xs text-slate-500">{item.facultyCode}</p>
                                        </div>
                                        <span className="font-bold text-slate-900 dark:text-slate-100">{item.studentCount} SV</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                                        <div className="h-2 rounded-full bg-gradient-to-r from-primary to-rose-500" style={{ width: `${width}%` }} />
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-700">Chưa có phân bố sinh viên theo khoa.</div>
                        )}
                    </div>
                </article>

                <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Sinh viên cập nhật gần đây</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Các tài khoản mới trong hệ thống.</p>
                        </div>
                    </div>

                    <div className="mt-5 space-y-4">
                        {recentStudents.length > 0 ? recentStudents.map((student) => (
                            <div key={student.studentId} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-slate-100">{student.fullName}</p>
                                        <p className="text-sm text-slate-500">{student.studentCode}</p>
                                    </div>
                                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[student.status] || "bg-slate-100 text-slate-600"}`}>
                                        {student.status}
                                    </span>
                                </div>
                                <p className="mt-3 text-sm text-slate-500">{student.classCode || "Chưa có lớp"} · {student.facultyName || "Chưa có khoa"}</p>
                                <p className="mt-1 text-xs text-slate-400">{student.createdAt || "--"}</p>
                            </div>
                        )) : (
                            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-700">Chưa có sinh viên nào.</div>
                        )}
                    </div>
                </article>
            </section>
        </div>
    );
}