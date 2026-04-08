import { useMemo, useState } from "react";

const DEFAULT_FORM = {
    fullName: "",
    lecturerCode: "",
    email: "",
    username: "",
    password: "",
    facultyId: "",
    status: "ACTIVE",
};

export default function AdminLecturerForm({ workspace }) {
    const { options, busy, flash, createLecturer } = workspace;
    const [form, setForm] = useState(DEFAULT_FORM);
    const [message, setMessage] = useState("");
    const defaultFacultyId = useMemo(() => {
        const firstFaculty = options.faculties[0];
        return firstFaculty ? String(firstFaculty.id) : "";
    }, [options.faculties]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        await createLecturer({
            fullName: form.fullName,
            lecturerCode: form.lecturerCode,
            email: form.email,
            username: form.username,
            password: form.password,
            facultyId: Number(form.facultyId || defaultFacultyId),
            status: form.status,
        });

        setMessage(`Đã tạo tài khoản giảng viên cho ${form.fullName.trim()}.`);
        setForm((previous) => ({
            ...DEFAULT_FORM,
            facultyId: defaultFacultyId || previous.facultyId,
        }));
    };

    return (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Thêm giảng viên</p>

                {message ? (
                    <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:text-emerald-200">
                        {message}
                    </div>
                ) : null}

                {flash.message && flash.type === "error" ? (
                    <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/30 dark:bg-rose-900/10 dark:text-rose-200">
                        {flash.message}
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
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Mã giảng viên</span>
                        <input
                            required
                            value={form.lecturerCode}
                            onChange={(event) => setForm((previous) => ({ ...previous, lecturerCode: event.target.value }))}
                            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                            placeholder="VD: GV001"
                        />
                    </label>

                    <label className="grid gap-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Khoa</span>
                        <select
                            required
                            value={form.facultyId || defaultFacultyId}
                            onChange={(event) => setForm((previous) => ({ ...previous, facultyId: event.target.value }))}
                            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                        >
                            <option value="">Chọn khoa</option>
                            {options.faculties.map((faculty) => (
                                <option key={faculty.id} value={faculty.id}>
                                    {faculty.name}
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
                            placeholder="ten.gv@ptit.edu.vn"
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
                            disabled={busy}
                            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <span className="material-symbols-outlined text-base">save</span>
                            {busy ? "Đang lưu..." : "Tạo giảng viên"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setForm((previous) => ({ ...DEFAULT_FORM, facultyId: defaultFacultyId || previous.facultyId }))}
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
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Đây là quy tắc đang được backend áp dụng để tạo giảng viên an toàn hơn.</p>
                </div>

                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">Email và username</p>
                        <p className="mt-1">Không được trùng với tài khoản đã tồn tại.</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">Mã giảng viên</p>
                        <p className="mt-1">Cần duy nhất trong toàn hệ thống giảng viên.</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">Mật khẩu mặc định</p>
                        <p className="mt-1">Nếu bỏ trống, backend sẽ gán một mật khẩu mặc định.</p>
                    </div>
                </div>
            </aside>
        </div>
    );
}