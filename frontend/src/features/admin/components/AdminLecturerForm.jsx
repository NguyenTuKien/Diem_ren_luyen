import { useEffect, useMemo, useState } from "react";
import { createAdminClass } from "../../../api/adminClassApi";

const DEFAULT_FORM = {
    fullName: "",
    lecturerCode: "",
    email: "",
    username: "",
    password: "",
    facultyId: "",
    status: "ACTIVE",
};

const EMPTY_POPUP = { type: "", message: "" };

export default function AdminLecturerForm({ workspace }) {
    const { options, busy, createLecturer } = workspace;
    const [form, setForm] = useState(DEFAULT_FORM);
    const [classCode, setClassCode] = useState("");
    const [popup, setPopup] = useState(EMPTY_POPUP);

    const defaultFacultyId = useMemo(() => {
        const firstFaculty = options.faculties[0];
        return firstFaculty ? String(firstFaculty.id) : "";
    }, [options.faculties]);

    useEffect(() => {
        if (!form.facultyId && defaultFacultyId) {
            setForm((previous) => ({ ...previous, facultyId: defaultFacultyId }));
        }
    }, [defaultFacultyId, form.facultyId]);

    useEffect(() => {
        if (!popup.message) {
            return undefined;
        }

        const timeout = window.setTimeout(() => {
            setPopup(EMPTY_POPUP);
        }, popup.type === "error" ? 6500 : 5000);

        return () => window.clearTimeout(timeout);
    }, [popup]);

    const selectedFacultyId = form.facultyId || defaultFacultyId;

    const resetForm = () => {
        setForm((previous) => ({
            ...DEFAULT_FORM,
            facultyId: defaultFacultyId || previous.facultyId,
        }));
        setClassCode("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setPopup(EMPTY_POPUP);

        if (!form.fullName.trim() || !form.lecturerCode.trim() || !form.email.trim()) {
            setPopup({
                type: "error",
                message: "Vui lòng nhập đầy đủ họ tên, mã giảng viên và email.",
            });
            return;
        }

        if (!selectedFacultyId) {
            setPopup({
                type: "error",
                message: "Vui lòng chọn khoa cho giảng viên.",
            });
            return;
        }

        try {
            const lecturerResponse = await createLecturer({
                fullName: form.fullName,
                lecturerCode: form.lecturerCode,
                email: form.email,
                username: form.username,
                password: form.password,
                facultyId: Number(selectedFacultyId),
                status: form.status,
            });

            const lecturerId = lecturerResponse?.lecturerId;
            const nextClassCode = classCode.trim().toUpperCase();

            if (nextClassCode && lecturerId) {
                await createAdminClass({
                    classCode: nextClassCode,
                    facultyId: Number(selectedFacultyId),
                    lecturerId,
                });
            }

            await workspace.refresh();

            setPopup({
                type: "success",
                message: `Tạo giảng viên thành công: ${form.fullName.trim()}.`,
            });
            resetForm();
        } catch (submitError) {
            const errorMessage = submitError.message || "Không thể tạo giảng viên.";
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
                        <p className="font-semibold">{popup.type === "error" ? "Thao tác thất bại" : "Thêm giảng viên thành công"}</p>
                        <p className="mt-1">{popup.message}</p>
                    </div>
                </div>
            ) : null}

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Thêm giảng viên</p>

                <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                    <div className="grid gap-4 md:grid-cols-2">
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
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Lớp phụ trách</span>
                            <input
                                value={classCode}
                                onChange={(event) => setClassCode(event.target.value)}
                                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                                placeholder="VD: B23CTCN01-B"
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
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
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
                            onClick={resetForm}
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
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Mã lớp là thông tin nhập thêm ngay khi tạo giảng viên mới.</p>
                </div>

                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">Khoa</p>
                        <p className="mt-1">Bắt buộc chọn khoa trước khi lưu.</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">Lớp mới</p>
                        <p className="mt-1">Nhập theo dạng B23CTCN01-B để tạo nhanh lớp phụ trách.</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">Mã lớp</p>
                        <p className="mt-1">Cần duy nhất trong toàn hệ thống lớp.</p>
                    </div>
                </div>
            </aside>
        </div>
    );
}
