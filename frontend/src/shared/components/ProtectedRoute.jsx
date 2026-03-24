import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.effectiveRole)
  ) {
    return <Navigate to={user.dashboardPath || "/dashboard/student"} replace />;
  }

  return children;
}
