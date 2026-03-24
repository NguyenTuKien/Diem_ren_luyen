import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../../shared/api/http";
import { useAuth } from "../../auth/context/AuthContext";

const STATUS_LABEL = {
  ACTIVE: "Hoạt động",
  LOCKED: "Bị khóa",
  DELETED: "Đã xóa",
};

export default function MonitorClassPage() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchMembers() {
      setLoading(true);
      setError("");
      try {
        const payload = await apiRequest(`/monitor/class-members?monitorUserId=${user.userId}`);
        if (!ignore) {
          setData(payload);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchMembers();

    return () => {
      ignore = true;
    };
  }, [user.userId]);

  const filteredMembers = useMemo(() => {
    if (!data?.members) {
      return [];
    }

    const normalized = keyword.trim().toLowerCase();
    if (!normalized) {
      return data.members;
    }

    return data.members.filter((member) => {
      const haystack = `${member.studentCode} ${member.fullName} ${member.email}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [data?.members, keyword]);

  if (loading) {
    return <div className="page-state">Đang tải danh sách lớp...</div>;
  }

  if (error) {
    return <div className="page-state error">Không thể tải dữ liệu: {error}</div>;
  }

  return (
    <div className="monitor-layout">
      <header className="monitor-top">
        <div>
          <h1>Danh sách lớp quản lý</h1>
          <p>
            Lớp {data.classCode} · {data.facultyName} · {data.totalMembers} thành viên
          </p>
        </div>

        <div className="monitor-actions">
          <input
            type="search"
            placeholder="Tìm theo tên, MSSV, email..."
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <button type="button" className="btn-outline" onClick={logout}>
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="table-panel">
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
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={7}>Không có sinh viên phù hợp.</td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr key={member.studentId}>
                  <td>{member.studentCode}</td>
                  <td>{member.fullName}</td>
                  <td>{member.email}</td>
                  <td>{member.totalPoint ?? 0}</td>
                  <td>{member.mandatoryParticipation}</td>
                  <td>
                    <span className={`pill role ${member.monitor ? "monitor" : "student"}`}>
                      {member.monitor ? "Monitor" : "Student"}
                    </span>
                  </td>
                  <td>
                    <span className={`pill status ${member.accountStatus.toLowerCase()}`}>
                      {STATUS_LABEL[member.accountStatus] || member.accountStatus}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
