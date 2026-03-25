import { useEffect, useState } from "react";
import { apiRequest } from "../api/http";
import { useAuth } from "../context/AuthContext";

export default function MonitorClassPage() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    apiRequest(`/monitor/class-members?monitorUserId=${user.userId}`)
      .then((payload) => {
        if (!ignore) {
          setData(payload);
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

  if (loading) {
    return <div className="loading-state">Đang tải danh sách lớp...</div>;
  }

  if (error) {
    return <div className="error-state">Không thể tải dữ liệu: {error}</div>;
  }

  return (
    <div className="monitor-shell">
      <header className="monitor-header">
        <div>
          <h1>Danh sách lớp quản lý</h1>
          <p>
            Lớp {data.classCode} · {data.facultyName} · {data.totalMembers} thành viên
          </p>
        </div>
        <button type="button" className="ghost-btn" onClick={logout}>
          Đăng xuất
        </button>
      </header>

      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>MSSV</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Tổng điểm hiện tại</th>
              <th>Tình trạng sự kiện bắt buộc</th>
              <th>Vai trò</th>
              <th>Tài khoản</th>
            </tr>
          </thead>
          <tbody>
            {data.members.map((member) => (
              <tr key={member.studentId}>
                <td>{member.studentCode}</td>
                <td>{member.fullName}</td>
                <td>{member.email}</td>
                <td>{member.totalPoint ?? 0}</td>
                <td>{member.mandatoryParticipation}</td>
                <td>
                  {member.monitor ? (
                    <span className="role-pill monitor">MONITOR</span>
                  ) : (
                    <span className="role-pill student">STUDENT</span>
                  )}
                </td>
                <td>
                  <span className={`status-pill ${member.accountStatus.toLowerCase()}`}>
                    {member.accountStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
