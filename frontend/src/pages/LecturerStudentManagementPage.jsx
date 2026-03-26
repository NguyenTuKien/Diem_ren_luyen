import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiRequest } from "../api/http";
import { useAuth } from "../context/AuthContext";
import "../App.css";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "LOCKED", label: "Bị khóa" },
  { value: "DELETED", label: "Đã xóa" },
];

const MANUAL_DEFAULT = {
  classId: "",
  fullName: "",
  email: "",
  studentCode: "",
  username: "",
  password: "",
};

export default function LecturerStudentManagementPage() {
  const { user, logout } = useAuth();
  const lecturerId = user.userId;
  const fileInputRef = useRef(null);

  const [options, setOptions] = useState({ faculties: [], classes: [] });
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({
    totalStudents: 0,
    activeStudents: 0,
    lockedStudents: 0,
    monitorStudents: 0,
  });
  const [filters, setFilters] = useState({
    keyword: "",
    facultyId: "",
    classId: "",
    status: "",
  });
  const [manualForm, setManualForm] = useState(MANUAL_DEFAULT);
  const [showManualModal, setShowManualModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState({ type: "", message: "" });

  const classOptions = useMemo(() => {
    if (!filters.facultyId) {
      return options.classes;
    }
    return options.classes.filter(
      (item) => String(item.facultyId) === String(filters.facultyId),
    );
  }, [options.classes, filters.facultyId]);

  const loadOptions = useCallback(async () => {
    try {
      const data = await apiRequest(`/lecturer/students/options?lecturerId=${lecturerId}`);
      setOptions(data);
      if (data.classes.length > 0) {
        setManualForm((prev) =>
          prev.classId ? prev : { ...prev, classId: String(data.classes[0].id) },
        );
      }
    } catch (err) {
      setFlash({ type: "error", message: err.message });
    }
  }, [lecturerId]);

  const loadStudents = useCallback(async () => {
    const params = new URLSearchParams();
    params.set("lecturerId", lecturerId);
    if (filters.keyword.trim()) {
      params.set("keyword", filters.keyword.trim());
    }
    if (filters.facultyId) {
      params.set("facultyId", filters.facultyId);
    }
    if (filters.classId) {
      params.set("classId", filters.classId);
    }
    if (filters.status) {
      params.set("status", filters.status);
    }

    try {
      const data = await apiRequest(`/lecturer/students?${params.toString()}`);
      setRows(data.students || []);
      setSummary({
        totalStudents: data.totalStudents || 0,
        activeStudents: data.activeStudents || 0,
        lockedStudents: data.lockedStudents || 0,
        monitorStudents: data.monitorStudents || 0,
      });
    } catch (err) {
      setFlash({ type: "error", message: err.message });
    }
  }, [lecturerId, filters]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const runAction = async (runner, successMessage) => {
    setBusy(true);
    setFlash({ type: "", message: "" });
    try {
      await runner();
      setFlash({ type: "success", message: successMessage });
      await loadStudents();
    } catch (err) {
      setFlash({ type: "error", message: err.message });
    } finally {
      setBusy(false);
    }
  };

  const submitManualStudent = (event) => {
    event.preventDefault();
    runAction(
      async () => {
        await apiRequest(`/lecturer/students/manual?lecturerId=${lecturerId}`, {
          method: "POST",
          body: JSON.stringify({
            ...manualForm,
            classId: Number(manualForm.classId),
          }),
        });
        setShowManualModal(false);
        setManualForm((prev) => ({ ...MANUAL_DEFAULT, classId: prev.classId }));
      },
      "Thêm sinh viên thành công.",
    );
  };

  const onFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setBusy(true);
    const formData = new FormData();
    formData.append("file", file);
    apiRequest(`/lecturer/students/import?lecturerId=${lecturerId}`, {
      method: "POST",
      body: formData,
      headers: {},
    })
      .then((result) => {
        setFlash({
          type: result.errors?.length ? "warning" : "success",
          message: `Import: ${result.importedCount} thành công, ${result.skippedCount} bỏ qua.`,
        });
        return loadStudents();
      })
      .catch((err) => {
        setFlash({ type: "error", message: err.message });
      })
      .finally(() => {
        setBusy(false);
      });

    event.target.value = "";
  };

  const exportCsv = () => {
    const headers = [
      "studentCode",
      "fullName",
      "email",
      "classCode",
      "role",
      "accountStatus",
      "totalPoint",
      "mandatoryStatus",
    ];
    const lines = rows.map((row) =>
      [
        row.studentCode,
        row.fullName,
        row.email,
        row.classCode,
        row.role,
        row.accountStatus,
        row.totalPoint,
        row.mandatoryStatus,
      ]
        .map((item) => `"${String(item ?? "").replaceAll('"', '""')}"`)
        .join(","),
    );
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student-list.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="management-shell">
      <aside className="management-sidebar">
        <h2>EduManage</h2>
        <div className="menu-group">
          <p>Chính</p>
          <button type="button" className="side-nav-item active">
            Danh sách Sinh viên
          </button>
          <button type="button" className="side-nav-item">
            Quản lý Lớp
          </button>
          <button type="button" className="side-nav-item">
            Nhập dữ liệu Excel
          </button>
        </div>
      </aside>

      <section className="management-content">
        <header className="management-header">
          <div>
            <h1>Quản lý Sinh viên</h1>
            <p>Tổng số {summary.totalStudents} sinh viên</p>
          </div>
          <div className="header-actions">
            <button type="button" className="ghost-btn" onClick={exportCsv}>
              Xuất Excel
            </button>
            <button
              type="button"
              className="ghost-btn emphasis"
              onClick={() => fileInputRef.current?.click()}
            >
              Import Excel
            </button>
            <button type="button" className="solid-btn" onClick={() => setShowManualModal(true)}>
              Thêm thủ công
            </button>
            <button type="button" className="ghost-btn small" onClick={logout}>
              Đăng xuất
            </button>
          </div>
        </header>

        <input
          ref={fileInputRef}
          hidden
          type="file"
          accept=".xlsx,.xls"
          onChange={onFileChange}
        />

        <section className="summary-bar">
          <span>Hoạt động: {summary.activeStudents}</span>
          <span>Bị khóa: {summary.lockedStudents}</span>
          <span>Monitor: {summary.monitorStudents}</span>
        </section>

        <section className="filters-row">
          <input
            placeholder="Tìm theo tên, MSSV, email"
            value={filters.keyword}
            onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))}
          />
          <select
            value={filters.facultyId}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                facultyId: event.target.value,
                classId: "",
              }))
            }
          >
            <option value="">Tất cả khoa</option>
            {options.faculties.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.code} - {faculty.name}
              </option>
            ))}
          </select>
          <select
            value={filters.classId}
            onChange={(event) => setFilters((prev) => ({ ...prev, classId: event.target.value }))}
          >
            <option value="">Tất cả lớp</option>
            {classOptions.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.classCode}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value || "all"} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </section>

        {flash.message && <div className={`flash-message ${flash.type}`}>{flash.message}</div>}

        <section className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sinh viên</th>
                <th>MSSV / Lớp</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Điểm</th>
                <th>Sự kiện bắt buộc</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7}>Không có sinh viên phù hợp bộ lọc.</td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.studentId}>
                  <td>
                    <strong>{row.fullName}</strong>
                    <small>{row.email}</small>
                  </td>
                  <td>
                    <strong>{row.studentCode}</strong>
                    <small>{row.classCode}</small>
                  </td>
                  <td>
                    <span className={`role-pill ${row.role.toLowerCase()}`}>{row.role}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${row.accountStatus.toLowerCase()}`}>
                      {row.accountStatus}
                    </span>
                  </td>
                  <td>{row.totalPoint ?? 0}</td>
                  <td>{row.mandatoryStatus}</td>
                  <td>
                    <div className="action-row">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          runAction(
                            () =>
                              apiRequest(
                                `/lecturer/students/${row.studentId}/monitor?lecturerId=${lecturerId}`,
                                { method: "PUT" },
                              ),
                            `Đã gán ${row.fullName} làm monitor.`,
                          )
                        }
                      >
                        Gán Monitor
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          runAction(
                            () =>
                              apiRequest(
                                `/lecturer/students/${row.studentId}/status?lecturerId=${lecturerId}`,
                                {
                                  method: "PUT",
                                  body: JSON.stringify({
                                    status: row.accountStatus === "LOCKED" ? "ACTIVE" : "LOCKED",
                                  }),
                                },
                              ),
                            row.accountStatus === "LOCKED"
                              ? `Đã mở khóa ${row.fullName}.`
                              : `Đã khóa ${row.fullName}.`,
                          )
                        }
                      >
                        {row.accountStatus === "LOCKED" ? "Mở khóa" : "Khóa"}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        className="danger-link"
                        onClick={() =>
                          runAction(
                            () =>
                              apiRequest(
                                `/lecturer/students/${row.studentId}?lecturerId=${lecturerId}`,
                                { method: "DELETE" },
                              ),
                            `Đã xóa mềm ${row.fullName}.`,
                          )
                        }
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </section>

      {showManualModal && (
        <div className="modal-backdrop">
          <form className="modal-card" onSubmit={submitManualStudent}>
            <h3>Thêm sinh viên thủ công</h3>
            <label>
              Họ và tên
              <input
                value={manualForm.fullName}
                onChange={(event) =>
                  setManualForm((prev) => ({ ...prev, fullName: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Mã sinh viên
              <input
                value={manualForm.studentCode}
                onChange={(event) =>
                  setManualForm((prev) => ({ ...prev, studentCode: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={manualForm.email}
                onChange={(event) =>
                  setManualForm((prev) => ({ ...prev, email: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Lớp
              <select
                value={manualForm.classId}
                onChange={(event) =>
                  setManualForm((prev) => ({ ...prev, classId: event.target.value }))
                }
                required
              >
                <option value="">Chọn lớp</option>
                {options.classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.classCode}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Username (tùy chọn)
              <input
                value={manualForm.username}
                onChange={(event) =>
                  setManualForm((prev) => ({ ...prev, username: event.target.value }))
                }
              />
            </label>
            <label>
              Mật khẩu (để trống sẽ dùng UniPoint@123)
              <input
                type="text"
                value={manualForm.password}
                onChange={(event) =>
                  setManualForm((prev) => ({ ...prev, password: event.target.value }))
                }
              />
            </label>

            <div className="modal-actions">
              <button type="button" className="ghost-btn" onClick={() => setShowManualModal(false)}>
                Hủy
              </button>
              <button type="submit" className="solid-btn" disabled={busy}>
                Lưu
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
