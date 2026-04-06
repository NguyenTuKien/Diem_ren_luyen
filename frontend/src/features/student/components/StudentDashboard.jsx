import { useAuth } from "../../../context/AuthContext";
import { useStudentDashboard } from "../hooks/useStudentDashboard";
import "../../../styles/StudentDashboard.css";

function getGreetingName(name) {
  if (!name) {
    return "bạn";
  }
  const parts = name.split(" ").filter(Boolean);
  return parts[parts.length - 1] || name;
}

function getEventBadge(startTime) {
  if (!startTime) {
    return { day: "--", month: "TH--" };
  }
  const [datePart] = startTime.split(" ");
  const [day, month] = datePart.split("/");
  const monthNumber = Number(month);
  return {
    day: day || "--",
    month: Number.isNaN(monthNumber) ? "TH--" : `TH${monthNumber}`,
  };
}

function parseUiDate(createdAt) {
  if (!createdAt) {
    return null;
  }
  const [datePart] = createdAt.split(" ");
  if (!datePart) {
    return null;
  }
  const [dd, mm, yyyy] = datePart.split("/").map(Number);
  if (!dd || !mm || !yyyy) {
    return null;
  }
  return new Date(yyyy, mm - 1, dd);
}

function getHistoryDateLabel(createdAt) {
  const date = parseUiDate(createdAt);
  if (!date) {
    return "GẦN ĐÂY";
  }

  const current = new Date();
  current.setHours(0, 0, 0, 0);

  const compare = new Date(date);
  compare.setHours(0, 0, 0, 0);

  const diffDays = Math.round((current - compare) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "HÔM NAY";
  }
  if (diffDays === 1) {
    return "HÔM QUA";
  }

  const day = String(compare.getDate()).padStart(2, "0");
  const month = compare.getMonth() + 1;
  return `${day} THG ${month}`;
}

function getHistoryHint(status) {
  switch (status) {
    case "APPROVED":
      return "+2 điểm rèn luyện";
    case "REJECTED":
      return "Cần cập nhật minh chứng";
    default:
      return "Đang chờ duyệt";
  }
}

export default function StudentDashboard({ onNavigate }) {
  const { user } = useAuth();
  const { dashboard, loading, error } = useStudentDashboard(user?.userId);

  if (loading) {
    return <div className="page-state">Đang tải dashboard sinh viên...</div>;
  }

  if (error) {
    return <div className="page-state error">Không thể tải dữ liệu: {error}</div>;
  }

  if (!dashboard) {
    return <div className="page-state error">Không có dữ liệu dashboard.</div>;
  }

  const safeScore = Math.max(0, Math.min(100, Number(dashboard.totalScore) || 0));
  const upcomingEvents = Array.isArray(dashboard.upcomingEvents) ? dashboard.upcomingEvents : [];
  const history = Array.isArray(dashboard.history) ? dashboard.history : [];
  const greetingName = getGreetingName(dashboard.fullName);

  return (
    <main className="student-main">
      <section className="student-hero-card">
        <div className="student-hero-left">
          <div className="student-hero-avatar">
            <span className="material-symbols-outlined">school</span>
          </div>
          <div>
            <h1>Chào buổi sáng, {greetingName}!</h1>
            <p>
              MSSV: {dashboard.studentCode} · Lớp: {dashboard.classCode || "--"} ·{" "}
              {dashboard.facultyName || "Khoa đang cập nhật"}
            </p>
          </div>
        </div>

        <div className="student-hero-actions">
          <button
            type="button"
            className="student-hero-btn primary"
            onClick={() => onNavigate?.("scan-qr")}
          >
            <span className="material-symbols-outlined">qr_code_scanner</span>
            Quét QR
          </button>
          <button
            type="button"
            className="student-hero-btn outline"
            onClick={() => onNavigate?.("evidence")}
          >
            <span className="material-symbols-outlined">task_alt</span>
            Minh chứng
          </button>
        </div>
      </section>

      <section className="student-kpi-row">
        <article className="student-kpi-box">
          <div className="student-kpi-title">
            <h3>Điểm rèn luyện</h3>
            <span>+{(safeScore / 15).toFixed(1)}</span>
          </div>
          <p className="student-kpi-number">
            {safeScore}/100 <em>Tốt</em>
          </p>
          <div className="student-kpi-progress">
            <span style={{ width: `${safeScore}%` }} />
          </div>
        </article>

        <article className="student-kpi-box">
          <div className="student-kpi-title">
            <h3>Hoạt động tham gia</h3>
            <span className="material-symbols-outlined">event_available</span>
          </div>
          <p className="student-kpi-number">{dashboard.joinedActivities}</p>
          <small>Trong học kỳ này</small>
        </article>

        <article className="student-kpi-box">
          <div className="student-kpi-title">
            <h3>Xếp loại dự kiến</h3>
            <span className="material-symbols-outlined">workspace_premium</span>
          </div>
          <p className="student-kpi-number">{dashboard.rankLabel}</p>
          <small>Top 5% toàn khoa</small>
        </article>
      </section>

      <section className="student-content-row">
        <article className="student-events-box">
          <div className="student-section-title">
            <h2>Sự kiện sắp tới</h2>
            <button type="button">Xem tất cả</button>
          </div>

          {upcomingEvents.length === 0 ? (
            <p className="student-empty">Chưa có sự kiện sắp tới.</p>
          ) : (
            <div className="student-events-list">
              {upcomingEvents.map((event) => {
                const badge = getEventBadge(event.startTime);
                return (
                  <div key={event.id} className="student-event-row">
                    <div className="student-event-badge">
                      <span>{badge.month}</span>
                      <strong>{badge.day}</strong>
                    </div>
                    <div className="student-event-info">
                      <strong>{event.title}</strong>
                      <small>
                        <span className="material-symbols-outlined">location_on</span>
                        {event.location || "Đang cập nhật địa điểm"}
                      </small>
                    </div>
                    <span className="student-event-arrow material-symbols-outlined">
                      chevron_right
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </article>

        <article className="student-history-box">
          <div className="student-section-title student-section-title-history">
            <h2>Lịch sử hoạt động</h2>
          </div>

          {history.length === 0 ? (
            <p className="student-empty">Chưa có hoạt động.</p>
          ) : (
            <ul className="student-history-timeline">
              {history.map((item) => {
                const status = (item.status || "PENDING").toLowerCase();
                return (
                  <li key={item.id} className={`student-history-row ${status}`}>
                    <span className="student-history-dot" />
                    <div className="student-history-text">
                      <p>{getHistoryDateLabel(item.createdAt)}</p>
                      <strong>{item.title}</strong>
                      <small>{getHistoryHint((item.status || "PENDING").toUpperCase())}</small>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </article>
      </section>
    </main>
  );
}
