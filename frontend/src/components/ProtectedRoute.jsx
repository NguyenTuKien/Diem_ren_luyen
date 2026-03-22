import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ roles = [], children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.effectiveRole)) {
    return <Navigate to={user.dashboardPath || "/auth"} replace />;
  }

  return children;
}
