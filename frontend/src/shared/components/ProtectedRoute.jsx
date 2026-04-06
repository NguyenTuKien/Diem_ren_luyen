import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function normalizeRole(role) {
  if (!role) return "";
  // Strip ROLE_ prefix so "ROLE_ADMIN" matches "ADMIN"
  return role.startsWith("ROLE_") ? role.slice(5) : role;
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const userRole = normalizeRole(user.effectiveRole || user.role);
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to={user.dashboardPath || "/student"} replace />;
    }
  }

  return children;
}
