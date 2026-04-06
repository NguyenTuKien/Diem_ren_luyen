import { useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useMonitorData } from "../hooks/useMonitorData";
import "../../../styles/MonitorClass.css";

const STATUS_LABEL = {
  ACTIVE: "Hoạt động",
  LOCKED: "Bị khóa",
  DELETED: "Đã xóa",
};

const STATUS_FILTERS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "LOCKED", label: "Bị khóa" },
  { value: "DELETED", label: "Đã xóa" },
];

const MANDATORY_FILTERS = [
  { value: "ALL", label: "Tất cả mức hoàn thành" },
  { value: "PASSED", label: "Đạt bắt buộc" },
  { value: "MISSING", label: "Thiếu bắt buộc" },
];

const SORT_OPTIONS = [
  { value: "NAME_ASC", label: "Tên A-Z" },
  { value: "SCORE_DESC", label: "Điểm cao đến thấp" },
  { value: "SCORE_ASC", label: "Điểm thấp đến cao" },
];

function parseMandatoryStatus(text) {
  if (!text) {
    return { passed: true, ratio: "--" };
  }

  const normalized = String(text).toLowerCase();
  if (normalized.includes("thiếu")) {
    return { passed: false, ratio: text.split(" ")[0] || text };
  }
  if (normalized.includes("đạt")) {
    return { passed: true, ratio: text.split(" ")[0] || text };
  }
  return { passed: true, ratio: text };
}

export default function MonitorClass() {
  const { user } = useAuth();
  const { data, loading, error } = useMonitorData(user?.backendUserId ?? user?.userId);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [mandatoryFilter, setMandatoryFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NAME_ASC");
  const [notice, setNotice] = useState("");

  const membersSource = data?.members;
  const members = useMemo(() => (Array.isArray(membersSource) ? membersSource : []), [membersSource]);

  const filteredMembers = useMemo(() => {
    if (!members.length) {
      return [];
    }

    const normalized = keyword.trim().toLowerCase();
    const result = members
      .filter((member) => {
        const haystack = `${member.studentCode} ${member.fullName} ${member.email}`.toLowerCase();
        return !normalized || haystack.includes(normalized);
      })
      .filter((member) => {
        if (statusFilter === "ALL") {
          return true;
        }
        return (member.accountStatus || "").toUpperCase() === statusFilter;
      })
      .filter((member) => {
        if (mandatoryFilter === "ALL") {
          return true;
        }
        const mandatory = parseMandatoryStatus(member.mandatoryParticipation);
        return mandatoryFilter === "PASSED" ? mandatory.passed : !mandatory.passed;
      })
      .sort((first, second) => {
        if (sortBy === "SCORE_DESC") {
          return (second.totalPoint ?? 0) - (first.totalPoint ?? 0);
        }
        if (sortBy === "SCORE_ASC") {
          return (first.totalPoint ?? 0) - (second.totalPoint ?? 0);
        }
        return String(first.fullName || "").localeCompare(String(second.fullName || ""), "vi");
      });

    return result;
  }, [members, keyword, mandatoryFilter, sortBy, statusFilter]);

  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter((member) => member.accountStatus === "ACTIVE").length;
    const monitorCount = members.filter((member) => member.monitor).length;
    const missingMandatory = members.filter(
      (member) => !parseMandatoryStatus(member.mandatoryParticipation).passed,
    ).length;

    return {
      total,
      active,
      monitorCount,
      missingMandatory,
    };
  }, [members]);

  const topSupportList = useMemo(
    () =>
      filteredMembers
        .filter((member) => !parseMandatoryStatus(member.mandatoryParticipation).passed)
        .slice(0, 5),
    [filteredMembers],
  );

  const handleExportExcel = () => {
    const tableHeader = `
      <tr>
        <th>MSSV</th>
        <th>Họ tên</th>
        <th>Email</th>
        <th>Điểm hiện tại</th>
        <th>Sự kiện bắt buộc</th>
        <th>Vai trò</th>
        <th>Trạng thái</th>
      </tr>
    `;

    const tableRows = filteredMembers
      .map(
        (member) => `
          <tr>
            <td>${member.studentCode ?? ""}</td>
            <td>${member.fullName ?? ""}</td>
            <td>${member.email ?? ""}</td>
            <td>${member.totalPoint ?? 0}</td>
            <td>${member.mandatoryParticipation ?? ""}</td>
            <td>${member.monitor ? "MONITOR" : "STUDENT"}</td>
            <td>${member.accountStatus ?? ""}</td>
          </tr>
        `,
      )
      .join("");

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="UTF-8" />
        </head>
        <body>
          <table border="1">
            ${tableHeader}
            ${tableRows}
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([excelHtml], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lop-${data.classCode || "monitor"}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setNotice("Đã xuất danh sách Excel theo bộ lọc hiện tại.");
  };

  if (loading) {
    return <div className="page-state">Đang tải danh sách lớp...</div>;
  }

  if (error) {
    return <div className="page-state error">Không thể tải dữ liệu: {error}</div>;
  }

  return (
    <section className="space-y-3">
      <section className="student-hero-card">
        <div className="student-hero-left">
          <div className="student-hero-avatar">
            <span className="material-symbols-outlined">groups</span>
          </div>
          <div>
            <h1>Quản lý lớp {data.classCode}</h1>
            <p>
              Theo dõi thành viên, rà soát hoạt động bắt buộc và nhắc nhở sinh viên chưa hoàn thành.
            </p>
          </div>
        </div>

        <div className="student-hero-actions">
          <button type="button" className="student-hero-btn primary" onClick={handleExportExcel}>
            <span className="material-symbols-outlined">download</span>
            Xuất Excel
          </button>
        </div>
      </section>

      {notice && <div className="monitor-notice-v2">{notice}</div>}

      <section className="student-kpi-row">
        <article className="student-kpi-box">
          <div className="student-kpi-title">
            <h3>Tổng thành viên</h3>
            <span className="material-symbols-outlined">groups</span>
          </div>
          <p className="student-kpi-number">{stats.total}</p>
          <small>Thành viên trong lớp</small>
        </article>

        <article className="student-kpi-box">
          <div className="student-kpi-title">
            <h3>Tài khoản hoạt động</h3>
            <span className="material-symbols-outlined">verified_user</span>
          </div>
          <p className="student-kpi-number">{stats.active}</p>
          <small>Đang sử dụng</small>
        </article>

        <article className="student-kpi-box">
          <div className="student-kpi-title">
            <h3>Thiếu bắt buộc</h3>
            <span className="material-symbols-outlined">warning</span>
          </div>
          <p className="student-kpi-number">{stats.missingMandatory}</p>
          <small>Cần nhắc nhở</small>
        </article>
      </section>

      <section className="monitor-tools-v2">
        <input
          type="search"
          placeholder="Tìm theo tên, MSSV, email..."
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          {STATUS_FILTERS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <select
          value={mandatoryFilter}
          onChange={(event) => setMandatoryFilter(event.target.value)}
        >
          {MANDATORY_FILTERS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          {SORT_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </section>

      <section className="monitor-content-v2">
        <article className="monitor-table-box-v2">
          <div className="monitor-section-title-v2">
            <h2>Danh sách thành viên lớp</h2>
            <small>{filteredMembers.length} kết quả theo bộ lọc</small>
          </div>

          <div className="monitor-table-wrap-v2">
            <table>
              <thead>
                <tr>
                  <th>MSSV</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Điểm</th>
                  <th>Bắt buộc</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7}>Không có sinh viên phù hợp.</td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const mandatory = parseMandatoryStatus(member.mandatoryParticipation);
                    return (
                      <tr key={member.studentId}>
                        <td>{member.studentCode}</td>
                        <td>{member.fullName}</td>
                        <td>{member.email}</td>
                        <td>{member.totalPoint ?? 0}</td>
                        <td>
                          <span
                            className={`monitor-pill-v2 mandatory ${mandatory.passed ? "passed" : "missing"}`}
                          >
                            {mandatory.ratio}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`monitor-pill-v2 role ${member.monitor ? "monitor" : "student"}`}
                          >
                            {member.monitor ? "Monitor" : "Student"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`monitor-pill-v2 status ${String(member.accountStatus || "ACTIVE").toLowerCase()}`}
                          >
                            {STATUS_LABEL[member.accountStatus] || member.accountStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="monitor-attention-box-v2">
          <div className="monitor-section-title-v2">
            <h2>Cần nhắc nhở</h2>
            <small>Top 5 thành viên thiếu bắt buộc</small>
          </div>

          {topSupportList.length === 0 ? (
            <p className="monitor-empty-v2">Không có thành viên cần nhắc nhở.</p>
          ) : (
            <ul>
              {topSupportList.map((member) => (
                <li key={member.studentId}>
                  <div>
                    <strong>{member.fullName}</strong>
                    <small>{member.studentCode}</small>
                  </div>
                  <span>{parseMandatoryStatus(member.mandatoryParticipation).ratio}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </section>
  );
}
