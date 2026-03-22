import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import "./App.css";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AuthPage from "./pages/AuthPage";
import LecturerStudentManagementPage from "./pages/LecturerStudentManagementPage";
import MonitorClassPage from "./pages/MonitorClassPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <Navigate to={user.dashboardPath || "/auth"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/auth" element={<AuthPage />} />

      <Route
        path="/dashboard/student"
        element={
          <ProtectedRoute roles={["STUDENT", "MONITOR"]}>
            <StudentDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/monitor/class"
        element={
          <ProtectedRoute roles={["MONITOR"]}>
            <MonitorClassPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/lecturer/students"
        element={
          <ProtectedRoute roles={["LECTURER"]}>
            <LecturerStudentManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
