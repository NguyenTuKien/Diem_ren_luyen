import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/http";
import { useAuth } from "../context/AuthContext";

const STUDENT_MENU = ["Dashboard", "Sự kiện", "Lịch sử hoạt động", "Khai báo minh chứng"];

export default function StudentDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    apiRequest("/student/dashboard")
      .then((payload) => {
        if (!ignore) {
          setDashboard(payload);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [user.userId]);

  const moveToRoleDashboard = () => {
    navigate(user.dashboardPath, { replace: true });
  };

  if (loading) {
    return <div className="loading-state">Đang tải dashboard sinh viên...</div>;
  }

  if (error) {
    return <div className="error-state">Không thể tải dữ liệu: {error}</div>;
  }

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <div className="sidebar-brand">EduPortal</div>
        <nav>
          {STUDENT_MENU.map((item, index) => (
            <button
              type="button"
              key={item}
              className={`side-nav-item ${index === 0 ? "active" : ""}`}
              onClick={moveToRoleDashboard}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="sidebar-help">
          <p>Hỗ trợ</p>
          <small>Trung tâm trợ giúp</small>
        </div>
      </aside>

      <section className="portal-content">
        <header className="portal-header">
          <div />
          <div className="profile-box">
            <div>
              <strong>{dashboard.fullName}</strong>
              <small>{dashboard.studentCode}</small>
            </div>
            <button type="button" className="ghost-btn small" onClick={logout}>
              Đăng xuất
            </button>
          </div>
        </header>

        <div className="hero-card">
          <div>
            <p className="hero-subtitle">Xin chào</p>
            <h2>{dashboard.fullName}</h2>
            <span>
              {dashboard.studentCode} · Lớp {dashboard.classCode} · {dashboard.facultyName}
            </span>
          </div>
          <div className="hero-actions">
            <button type="button" className="solid-btn">
              Quét QR
            </button>
            <button type="button" className="ghost-btn emphasis">
              Minh chứng
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <article className="stat-card">
            <h4>Điểm rèn luyện</h4>
            <p className="big">{dashboard.totalScore}/100</p>
          </article>
          <article className="stat-card">
            <h4>Hoạt động tham gia</h4>
            <p className="big">{dashboard.joinedActivities}</p>
          </article>
          <article className="stat-card">
            <h4>Xếp loại dự kiến</h4>
            <p className="big">{dashboard.rankLabel}</p>
          </article>
        </div>

        <div className="content-grid">
          <section className="panel-box">
            <div className="panel-title-row">
              <h3>Sự kiện sắp tới</h3>
            </div>
            <div className="event-list">
              {dashboard.upcomingEvents.length === 0 && <p>Chưa có sự kiện sắp tới.</p>}
              {dashboard.upcomingEvents.map((event) => (
                <article key={event.id} className="event-item">
                  <div>
                    <strong>{event.title}</strong>
                    <p>{event.location || "Đang cập nhật địa điểm"}</p>
                  </div>
                  <time>{event.startTime}</time>
                </article>
              ))}
            </div>
          </section>

          <section className="panel-box">
            <h3>Lịch sử hoạt động</h3>
            <ul className="history-list">
              {dashboard.history.length === 0 && <li>Chưa có hoạt động.</li>}
              {dashboard.history.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.createdAt || "Không rõ thời gian"}</small>
                  </div>
                  <span className={`status-tag ${item.status.toLowerCase()}`}>{item.status}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </div>
  );
}
