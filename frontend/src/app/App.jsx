import { Navigate, Route, Routes } from "react-router-dom";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import AuthLoginPage from "../pages/AuthLoginPage";
import EventDashboard from "../pages/EventDashboard";
import LecturerStudentManagementPage from "../pages/LecturerStudentManagementPage";
import MonitorClassPage from "../pages/MonitorClassPage";
import StudentDashboardPage from "../pages/StudentDashboardPage";
import OAuthCallback from "../pages/OAuthCallback";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";

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
      <Route path="/auth" element={<AuthLoginPage />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="/oauth-success" element={<OAuthCallback />} />

      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/events"
        element={
          <ProtectedRoute allowedRoles={["LECTURER", "ADMIN"]}>
            <EventDashboard />
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
