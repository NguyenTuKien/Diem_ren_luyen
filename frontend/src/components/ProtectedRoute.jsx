import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authFetch } from '../api/authFetch';

const normalizeRole = (role = '') => role.toString().trim().toUpperCase();

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsAuthorized(false);
          setIsChecking(false);
        }
        return;
      }

      try {
        const response = await authFetch('/api/v1/auth/me');
        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          setIsAuthenticated(false);
          setIsAuthorized(false);
          return;
        }

        const userInfo = await response.json();
        const userRole = normalizeRole(userInfo?.role);
        const expectedRole = normalizeRole(requiredRole);

        setIsAuthenticated(true);
        setIsAuthorized(!expectedRole || userRole === expectedRole);
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsAuthorized(false);
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [requiredRole]);

  if (isChecking) {
    return <div className="text-center py-10">Đang xác thực...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAuthorized) {
    return <Navigate to="/login?error=Ban%20khong%20co%20quyen%20truy%20cap%20trang%20nay" replace />;
  }

  return children;
};

export default ProtectedRoute;
