import { Navigate, Route, Routes } from "react-router-dom";
import AdminDashboardPage from "../features/admin/pages/AdminDashboardPage";
import AuthPage from "../features/auth/pages/AuthPage";
import LecturerStudentManagementPage from "../features/lecturer/pages/LecturerStudentManagementPage";
import MonitorClassPage from "../features/monitor/pages/MonitorClassPage";
import StudentDashboardPage from "../features/student/pages/StudentDashboardPage";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import { useAuth } from "../features/auth/context/AuthContext";

function HomeRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Navigate to={user.dashboardPath || "/dashboard/student"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="/oauth-success" element={<Navigate to="/auth" replace />} />

      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/lecturer/students"
        element={
          <ProtectedRoute allowedRoles={["LECTURER"]}>
            <LecturerStudentManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/monitor/class"
        element={
          <ProtectedRoute allowedRoles={["MONITOR"]}>
            <MonitorClassPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/student"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
