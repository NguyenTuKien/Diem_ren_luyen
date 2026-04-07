import { useEffect, useMemo, useState } from "react";

const STATUS_LABELS = {
    ACTIVE: "Hoạt động",
    LOCKED: "Bị khóa",
    DELETED: "Đã xóa",
};

const STATUS_STYLES = {
    ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    LOCKED: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    DELETED: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

function StatChip({ label, value }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm uppercase tracking-[0.18em] font-semibold text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-black text-slate-900 dark:text-slate-100">{value}</p>
        </div>
    );
}

export default function AdminLecturerManagement({ workspace, onNavigate }) {
    const {
        rows,
        stats,
        filters,
        setFilters,
        loading,
        busy,
        flash,
        options,
        selectedLecturer,
        selectedLecturerId,
        setSelectedLecturerId,
        updateLecturer,
        deleteLecturer,
    } = workspace;
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        fullName: "",
        lecturerCode: "",
        email: "",
        username: "",
        password: "",
        facultyId: "",
        status: "ACTIVE",
    });

    useEffect(() => {
        if (!selectedLecturer) {
            return;
        }
        setEditForm({
            fullName: selectedLecturer.fullName || "",
            lecturerCode: selectedLecturer.lecturerCode || "",
            email: selectedLecturer.email || "",
            username: selectedLecturer.username || "",
            password: "",
            facultyId: selectedLecturer.facultyId ? String(selectedLecturer.facultyId) : "",
            status: selectedLecturer.status || "ACTIVE",
        });
        setIsEditing(false);
    }, [selectedLecturer]);

    const hasPendingChanges = useMemo(() => {
        if (!selectedLecturer) {
            return false;
        }

        return (
            editForm.fullName.trim() !== (selectedLecturer.fullName || "") ||
            editForm.lecturerCode.trim() !== (selectedLecturer.lecturerCode || "") ||
            editForm.email.trim() !== (selectedLecturer.email || "") ||
            editForm.username.trim() !== (selectedLecturer.username || "") ||
            String(editForm.facultyId || "") !== String(selectedLecturer.facultyId || "") ||
            editForm.status !== (selectedLecturer.status || "ACTIVE") ||
            Boolean(editForm.password.trim())
        );
    }, [editForm, selectedLecturer]);

    const handleUpdateLecturer = async () => {
        if (!selectedLecturer) {
            return;
        }

        if (!hasPendingChanges) {
            setIsEditing(false);
            return;
        }

        await updateLecturer(selectedLecturer.lecturerId, {
            fullName: editForm.fullName,
            lecturerCode: editForm.lecturerCode,
            email: editForm.email,
            username: editForm.username,
            password: editForm.password,
            facultyId: Number(editForm.facultyId),
            status: editForm.status,
        });
        setIsEditing(false);
        setEditForm((previous) => ({ ...previous, password: "" }));
    };

    const handleToggleStatus = async () => {
        if (!selectedLecturer || selectedLecturer.status === "DELETED") {
            return;
        }

        const nextStatus = selectedLecturer.status === "LOCKED" ? "ACTIVE" : "LOCKED";

        await updateLecturer(selectedLecturer.lecturerId, {
            fullName: selectedLecturer.fullName,
            lecturerCode: selectedLecturer.lecturerCode,
            email: selectedLecturer.email,
            username: selectedLecturer.username,
            password: "",
            facultyId: selectedLecturer.facultyId,
            status: nextStatus,
        });
    };

    const handleDeleteLecturer = async () => {
        if (!selectedLecturer) {
            return;
        }
        const confirmed = window.confirm(
            `Xóa giảng viên ${selectedLecturer.fullName}?\nHệ thống sẽ chuyển trạng thái sang Đã xóa (không xóa cứng dữ liệu).`,
        );
        if (!confirmed) {
            return;
        }
        await deleteLecturer(selectedLecturer.lecturerId);
    };

    if (loading) {
        return (
            <div className="grid min-h-[60vh] place-items-center rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
                Đang tải dữ liệu giảng viên...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Danh sách giảng viên</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => onNavigate?.("createLecturer")}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                    >
                        <span className="material-symbols-outlined text-base">person_add</span>
                        Thêm giảng viên
                    </button>
                </div>

                {flash.message ? (
                    <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${flash.type === "error" ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/30 dark:bg-rose-900/10 dark:text-rose-200" : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:text-emerald-200"}`}>
                        {flash.message}
                    </div>
                ) : null}

                <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-5">
                    <StatChip label="Tổng" value={stats.totalLecturers ?? 0} />
                    <StatChip label="Hoạt động" value={stats.activeLecturers ?? 0} />
                    <StatChip label="Bị khóa" value={stats.lockedLecturers ?? 0} />
                    <StatChip label="Đã xóa" value={stats.deletedLecturers ?? 0} />
                    <StatChip label="Khoa" value={stats.totalFaculties ?? 0} />
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr_1fr]">
                    <input
                        type="search"
                        value={filters.keyword}
                        onChange={(event) => setFilters((previous) => ({ ...previous, keyword: event.target.value }))}
                        className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-primary focus:bg-white"
                        placeholder="Tìm theo tên, mã, email, khoa..."
                    />
                    <select
                        value={filters.facultyId}
                        onChange={(event) => setFilters((previous) => ({ ...previous, facultyId: event.target.value }))}
                        className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-primary focus:bg-white"
                    >
                        <option value="">Tất cả khoa</option>
                        {workspace.options.faculties.map((faculty) => (
                            <option key={faculty.id} value={faculty.id}>
                                {faculty.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filters.status}
                        onChange={(event) => setFilters((previous) => ({ ...previous, status: event.target.value }))}
                        className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-primary focus:bg-white"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="LOCKED">Bị khóa</option>
                        <option value="DELETED">Đã xóa</option>
                    </select>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-6 py-4">
                        <h2 className="text-lg font-bold text-slate-900">Bảng giảng viên</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="px-6 py-4">Giảng viên</th>
                                    <th className="px-6 py-4">Khoa</th>
                                    <th className="px-6 py-4">Trạng thái</th>
                                    <th className="px-6 py-4 text-right">Lớp</th>
                                    <th className="px-6 py-4 text-right">Tạo lúc</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.length > 0 ? rows.map((lecturer) => {
                                    const isSelected = selectedLecturerId === lecturer.lecturerId;
                                    return (
                                        <tr
                                            key={lecturer.lecturerId}
                                            className={`cursor-pointer transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-slate-50"}`}
                                            onClick={() => setSelectedLecturerId(lecturer.lecturerId)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-semibold text-slate-900">{lecturer.fullName}</p>
                                                    <p className="text-xs text-slate-500">{lecturer.lecturerCode} · {lecturer.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700">{lecturer.facultyName || "Chưa gán khoa"}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[lecturer.status] || "bg-slate-100 text-slate-600"}`}>
                                                    {STATUS_LABELS[lecturer.status] || lecturer.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">{lecturer.classCount ?? 0}</td>
                                            <td className="px-6 py-4 text-right text-sm text-slate-500">{lecturer.createdAt || "--"}</td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td className="px-6 py-10 text-sm text-slate-500" colSpan={5}>
                                            Không có giảng viên nào phù hợp bộ lọc hiện tại.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </article>

                <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Chi tiết giảng viên</h2>
                            <p className="text-sm text-slate-500">Xem nhanh thông tin của dòng đang chọn.</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                            {rows.length} bản ghi
                        </span>
                    </div>

                    {selectedLecturer ? (
                        <div className="mt-6 space-y-5">
                            <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-white to-rose-50 p-5 shadow-sm">
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{selectedLecturer.lecturerCode}</p>
                                <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">{selectedLecturer.fullName}</h3>
                                <p className="mt-2 text-sm text-slate-600">{selectedLecturer.email}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <StatChip label="Khoa" value={selectedLecturer.facultyName || "--"} />
                                <StatChip label="Lớp phụ trách" value={selectedLecturer.classCount ?? 0} />
                                <StatChip label="Tài khoản" value={selectedLecturer.username || "--"} />
                                <StatChip label="Trạng thái" value={STATUS_LABELS[selectedLecturer.status] || selectedLecturer.status} />
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Thao tác</p>
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() => onNavigate?.("createLecturer")}
                                        className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-white"
                                    >
                                        Thêm giảng viên
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"
                                    >
                                        Sửa thông tin
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleToggleStatus}
                                        disabled={busy || selectedLecturer.status === "DELETED"}
                                        className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {selectedLecturer.status === "LOCKED" ? "Mở khóa" : "Khóa tài khoản"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDeleteLecturer}
                                        disabled={busy || selectedLecturer.status === "DELETED"}
                                        className="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Xóa giảng viên
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedLecturerId(rows[0]?.lecturerId || null)}
                                        className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"
                                    >
                                        Chọn dòng đầu
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6 rounded-3xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                            Chưa chọn giảng viên nào.
                        </div>
                    )}
                </article>
            </section>

            {isEditing && selectedLecturer ? (
                <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-900/30 p-4">
                    <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Chỉnh sửa giảng viên</h3>
                                <p className="text-sm text-slate-500">Cập nhật thông tin cho {selectedLecturer.fullName}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600"
                            >
                                Đóng
                            </button>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <input
                                value={editForm.fullName}
                                onChange={(event) => setEditForm((previous) => ({ ...previous, fullName: event.target.value }))}
                                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-primary"
                                placeholder="Họ và tên"
                            />
                            <input
                                value={editForm.lecturerCode}
                                onChange={(event) => setEditForm((previous) => ({ ...previous, lecturerCode: event.target.value }))}
                                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-primary"
                                placeholder="Mã giảng viên"
                            />
                            <input
                                value={editForm.email}
                                onChange={(event) => setEditForm((previous) => ({ ...previous, email: event.target.value }))}
                                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-primary"
                                placeholder="Email"
                            />
                            <input
                                value={editForm.username}
                                onChange={(event) => setEditForm((previous) => ({ ...previous, username: event.target.value }))}
                                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-primary"
                                placeholder="Username"
                            />
                            <select
                                value={editForm.facultyId}
                                onChange={(event) => setEditForm((previous) => ({ ...previous, facultyId: event.target.value }))}
                                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-primary"
                            >
                                <option value="">Chọn khoa</option>
                                {options.faculties.map((faculty) => (
                                    <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                                ))}
                            </select>
                            <select
                                value={editForm.status}
                                onChange={(event) => setEditForm((previous) => ({ ...previous, status: event.target.value }))}
                                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-primary"
                            >
                                <option value="ACTIVE">Hoạt động</option>
                                <option value="LOCKED">Bị khóa</option>
                                <option value="DELETED">Đã xóa</option>
                            </select>
                            <input
                                type="password"
                                value={editForm.password}
                                onChange={(event) => setEditForm((previous) => ({ ...previous, password: event.target.value }))}
                                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-primary sm:col-span-2"
                                placeholder="Mật khẩu mới (để trống nếu không đổi)"
                            />
                        </div>

                        <div className="mt-6 flex flex-wrap justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleUpdateLecturer}
                                disabled={busy || !hasPendingChanges}
                                className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {busy ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}