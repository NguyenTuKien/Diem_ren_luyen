import { useAuth } from "../context/AuthContext";

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="admin-shell">
      <article className="admin-card">
        <h1>Dashboard Admin</h1>
        <p>
          Xin chào {user.displayName}. Bạn đã đăng nhập vai trò ADMIN. Phần module này có thể mở rộng
          thêm theo các chức năng quản trị hệ thống.
        </p>
        <button type="button" className="solid-btn" onClick={logout}>
          Đăng xuất
        </button>
      </article>
    </div>
  );
}
