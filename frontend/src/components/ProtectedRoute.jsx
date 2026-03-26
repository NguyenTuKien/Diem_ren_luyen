import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { authFetch } from '../api/authFetch'
import EventDashboard from '../pages/EventDashboard'
import QRScannerPage from '../pages/QRScannerPage'

const normalizeRole = (role = '') => {
  const normalized = role.toString().trim().toUpperCase();
  if (!normalized) {
    return '';
  }

  if (normalized.startsWith('ROLE_ROLE_')) {
    return normalized.replace(/^ROLE_/, '');
  }

  return normalized;
};

const buildNormalizedRedirectMap = (inputMap = {}) => {
  const outputMap = {};
  Object.entries(inputMap).forEach(([key, value]) => {
    outputMap[normalizeRole(key)] = value;
  });
  return outputMap;
};

const normalizeRoleList = (roles) => {
  if (!roles) {
    return [];
  }

  const list = Array.isArray(roles) ? roles : [roles];
  // ensure we handle single string elements properly
  return list.flatMap(r => typeof r === 'string' && r.startsWith('[') ? JSON.parse(r) : [r]).map(normalizeRole).filter(Boolean);
};

// Legacy guard for one-off use cases
export const ProtectedRoute = ({ children, requiredRole, roleRedirectMap, unauthorizedRedirectTo }) => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [redirectTarget, setRedirectTarget] = useState('');
  const [currentRole, setCurrentRole] = useState('');

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
        const expectedRoles = normalizeRoleList(requiredRole);
        const normalizedRoleRedirectMap = buildNormalizedRedirectMap(roleRedirectMap);
        const mappedTarget = normalizedRoleRedirectMap[userRole]
          || normalizedRoleRedirectMap[userRole.replace(/^ROLE_/, '')]
          || '';

        setIsAuthenticated(true);
        setCurrentRole(userRole);
        setRedirectTarget(mappedTarget || '');
        setIsAuthorized(
          expectedRoles.length === 0
          || expectedRoles.some((expectedRole) => {
            const normalizedUserRole = userRole.replace(/^ROLE_/, '');
            const normalizedExpectedRole = expectedRole.replace(/^ROLE_/, '');
            return userRole === expectedRole || normalizedUserRole === normalizedExpectedRole;
          })
          || userRole === 'ROLE_STUDENT' // Failsafe for Student
          || userRole === 'STUDENT'
        );
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsAuthorized(false);
          setCurrentRole('');
          setRedirectTarget('');
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
  }, [requiredRole, roleRedirectMap]);

  if (isChecking) {
    return <div className="text-center py-10">Đang xác thực...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (redirectTarget && redirectTarget !== location.pathname) {
    return <Navigate to={redirectTarget} replace />;
  }

  if (!isAuthorized && (currentRole === 'ROLE_STUDENT' || currentRole === 'STUDENT' || currentRole === 'ROLE_MONITOR' || currentRole === 'MONITOR')) {
    if (location.pathname !== '/checkin') {
      return <Navigate to="/checkin" replace />;
    }
  }

  if (!isAuthorized) {
    return <Navigate to={unauthorizedRedirectTo || '/login?error=Ban%20khong%20co%20quyen%20truy%20cap%20trang%20nay'} replace />;
  }

  return children;
}

const useAuthState = () => {
  const [state, setState] = useState({ checking: true, authenticated: false, role: '' })

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        if (isMounted) {
          setState({ checking: false, authenticated: false, role: '' })
        }
        return
      }

      try {
        const response = await authFetch('/api/v1/auth/me')
        if (!isMounted) return
        if (!response.ok) {
          setState({ checking: false, authenticated: false, role: '' })
          return
        }

        const userInfo = await response.json()
        const userRole = normalizeRole(userInfo?.role)
        setState({ checking: false, authenticated: true, role: userRole })
      } catch {
        if (isMounted) {
          setState({ checking: false, authenticated: false, role: '' })
        }
      }
    }

    checkAuth()
    return () => {
      isMounted = false
    }
  }, [])

  return state
}

const isAllowed = (userRole, allowedRoles = []) => {
  const expected = normalizeRoleList(allowedRoles)
  if (expected.length === 0) return true
  const normalizedUser = normalizeRole(userRole)
  return expected.some((role) => {
    const normalizedRole = normalizeRole(role)
    return normalizedRole === normalizedUser || normalizedRole === normalizedUser.replace(/^ROLE_/, '')
  })
}

const resolveLanding = (role) => {
  const normalized = normalizeRole(role)
  if (normalized === 'ROLE_ADMIN' || normalized === 'ADMIN') return '/admin'
  if (normalized === 'ROLE_LECTURER' || normalized === 'LECTURER') return '/lecturer'
  return '/'
}

const ProtectedRouter = () => {
  const location = useLocation()
  const { checking, authenticated, role } = useAuthState()

  if (checking) {
    return <div className="text-center py-10">Đang xác thực...</div>
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  const landing = resolveLanding(role)

  const guard = (allowedRoles, element) => {
    if (isAllowed(role, allowedRoles)) return element
    if (location.pathname !== landing) {
      return <Navigate to={landing} replace />
    }
    return <Navigate to="/login?error=Ban%20khong%20co%20quyen%20truy%20cap%20trang%20nay" replace />
  }

  return (
    <Routes>
      <Route path="/admin" element={guard(['ROLE_ADMIN'], <EventDashboard />)} />
      <Route path="/lecturer" element={guard(['ROLE_LECTURER'], <EventDashboard />)} />
      <Route path="/" element={guard(['ROLE_STUDENT', 'ROLE_MONITOR'], <QRScannerPage />)} />
      <Route path="*" element={<Navigate to={landing} replace />} />
    </Routes>
  )
}

export default ProtectedRouter
