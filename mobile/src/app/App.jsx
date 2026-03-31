import { Navigate, Route, Routes } from "react-router-dom";
import AuthLoginPage from "../pages/AuthLoginPage";
import OAuthCallback from "../pages/OAuthCallback";
import QRScannerPage from "../pages/QRScannerPage";
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
        path="/dashboard/student"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <QRScannerPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
