import { useEffect, useMemo, useState } from "react";

const DEFAULT_FORM = {
    fullName: "",
    studentCode: "",
    email: "",
    username: "",
    password: "",
    classId: "",
    role: "STUDENT",
    status: "ACTIVE",
};

const EMPTY_POPUP = { type: "", message: "" };

export default function AdminStudentForm({ studentWorkspace }) {
    const { options, busy, createStudent } = studentWorkspace;
    const [form, setForm] = useState(DEFAULT_FORM);
    const [popup, setPopup] = useState(EMPTY_POPUP);

    const defaultClassId = useMemo(() => String(options.classes[0]?.id || ""), [options.classes]);
    const hasClasses = options.classes.length > 0;

    useEffect(() => {
        if (!popup.message) {
            return undefined;
        }

        const timeout = window.setTimeout(() => {
            setPopup(EMPTY_POPUP);
        }, popup.type === "error" ? 6500 : 5000);

        return () => window.clearTimeout(timeout);
    }, [popup]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!hasClasses) {
            return;
        }

        setPopup(EMPTY_POPUP);

        try {
            await createStudent({
                fullName: form.fullName,
                studentCode: form.studentCode,
                email: form.email,
                username: form.username,
                password: form.password,
                classId: Number(form.classId || defaultClassId),
                role: form.role,
                status: form.status,
            });

            setPopup({
                type: "success",
                message: `Tạo sinh viên thành công: ${form.fullName.trim()}.`,
            });

            setForm((previous) => ({
                ...DEFAULT_FORM,
                classId: defaultClassId || previous.classId,
            }));
        } catch (submitError) {
            const errorMessage = submitError.message || "Không thể tạo sinh viên.";
            setPopup({ type: "error", message: errorMessage });
        }
    };

    return (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            {popup.message ? (
                <div className="fixed inset-x-0 top-0 z-[120] flex justify-center px-4 pt-5">
                    <div
                        className={`w-full max-w-md rounded-2xl border px-5 py-4 text-sm shadow-2xl ${popup.type === "error"
                                ? "border-rose-200 bg-rose-50 text-rose-700"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                            }`}
                    >
                        <p className="font-semibold">{popup.type === "error" ? "Thao tác thất bại" : "Thêm sinh viên thành công"}</p>
                        <p className="mt-1">{popup.message}</p>
                    </div>
                </div>
            ) : null}

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Thêm sinh viên</p>

                {!hasClasses ? (
                    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        Chưa có lớp trong hệ thống. Vui lòng tạo lớp trước khi thêm sinh viên.
                    </div>
                ) : null}

                <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                    <label className="grid gap-2 md:col-span-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Họ và tên</span>
                        <input
                            required
                            value={form.fullName}
                            onChange={(event) => setForm((previous) => ({ ...previous, fullName: event.target.value }))}
                            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                            placeholder="Ví dụ: Nguyễn Văn A"
                        />
                    </label>

                    <label className="grid gap-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Mã sinh viên</span>
                        <input
                            required
                            value={form.studentCode}
                            onChange={(event) => setForm((previous) => ({ ...previous, studentCode: event.target.value }))}
                            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                            placeholder="VD: B23CN001"
                        />
                    </label>

                    <label className="grid gap-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Lớp</span>
                        <select
                            required
                            value={form.classId || defaultClassId}
                            onChange={(event) => setForm((previous) => ({ ...previous, classId: event.target.value }))}
                            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                        >
                            <option value="">Chọn lớp</option>
                            {options.classes.map((classItem) => (
                                <option key={classItem.id} value={classItem.id}>
                                    {classItem.classCode}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="grid gap-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email</span>
                        <input
                            required
                            type="email"
                            value={form.email}
                            onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))}
                            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                            placeholder="ten.sv@ptit.edu.vn"
                        />
                    </label>

                    <label className="grid gap-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tài khoản</span>
                        <input
                            value={form.username}
                            onChange={(event) => setForm((previous) => ({ ...previous, username: event.target.value }))}
                            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                            placeholder="Để trống nếu muốn tự sinh"
                        />
                    </label>

                    <label className="grid gap-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Mật khẩu</span>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))}
                            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                            placeholder="Để trống dùng mặc định"
                        />
                    </label>

                    <label className="grid gap-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Vai trò</span>
                        <select
                            value={form.role}
                            onChange={(event) => setForm((previous) => ({ ...previous, role: event.target.value }))}
                            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                        >
                            <option value="STUDENT">Sinh viên</option>
                            <option value="MONITOR">Monitor</option>
                        </select>
                    </label>

                    <label className="grid gap-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Trạng thái</span>
                        <select
                            value={form.status}
                            onChange={(event) => setForm((previous) => ({ ...previous, status: event.target.value }))}
                            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                        >
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="LOCKED">Bị khóa</option>
                            <option value="DELETED">Đã xóa</option>
                        </select>
                    </label>

                    <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={busy || !hasClasses}
                            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <span className="material-symbols-outlined text-base">save</span>
                            {busy ? "Đang lưu..." : "Tạo sinh viên"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setForm((previous) => ({ ...DEFAULT_FORM, classId: defaultClassId || previous.classId }))}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                        >
                            <span className="material-symbols-outlined text-base">refresh</span>
                            Làm mới form
                        </button>
                    </div>
                </form>
            </section>

            <aside className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Ghi chú nhập liệu</h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Các quy tắc đang áp dụng khi tạo sinh viên trong hệ thống.</p>
                </div>

                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">Email và username</p>
                        <p className="mt-1">Không được trùng với tài khoản đã tồn tại.</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">Mã sinh viên</p>
                        <p className="mt-1">Cần duy nhất trên toàn hệ thống.</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">Vai trò Monitor</p>
                        <p className="mt-1">Có thể tạo sinh viên hoặc monitor ngay từ form này.</p>
                    </div>
                </div>
            </aside>
        </div>
    );
}
