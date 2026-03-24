import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authFetch } from '../api/authFetch';

const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsChecking(false);
        }
        return;
      }

      try {
        const response = await authFetch('/api/v1/auth/me');
        if (!isMounted) {
          return;
        }
        setIsAuthenticated(response.ok);
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
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
  }, []);

  if (isChecking) {
    return <div className="text-center py-10">Đang xác thực...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
