import { useAuth } from "../../auth/context/AuthContext";

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="admin-layout">
      <article className="admin-card">
        <h1>Dashboard Admin</h1>
        <p>
          Xin chào {user.displayName}. Hệ thống đã nhận diện đúng vai trò ADMIN và sẵn sàng cho
          các chức năng quản trị sự kiện.
        </p>
        <button type="button" className="btn-danger" onClick={logout}>
          Đăng xuất
        </button>
      </article>
    </div>
  );
}
