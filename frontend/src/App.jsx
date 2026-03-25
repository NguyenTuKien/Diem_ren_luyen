import { Navigate, Routes, Route } from 'react-router-dom';
import EventDashboard from './pages/EventDashboard';
import AuthLoginPages from './pages/AuthLoginPage';
import OAuthCallback from './pages/OAuthCallback';
import QRScannerPage from './pages/QRScannerPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthLoginPages />} />
      <Route path="/oauth-success" element={<OAuthCallback />} />
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute
            requiredRole="ROLE_ADMIN"
            roleRedirectMap={{
              ROLE_STUDENT: '/checkin',
              STUDENT: '/checkin',
              ROLE_MONITOR: '/checkin',
              MONITOR: '/checkin',
            }}
            unauthorizedRedirectTo="/checkin"
          >
            <EventDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkin"
        element={
          <ProtectedRoute requiredRole={["ROLE_STUDENT", "ROLE_MONITOR"]}>
            <QRScannerPage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute
            requiredRole="ROLE_ADMIN"
            roleRedirectMap={{
              ROLE_STUDENT: '/checkin',
              STUDENT: '/checkin',
              ROLE_MONITOR: '/checkin',
              MONITOR: '/checkin',
            }}
            unauthorizedRedirectTo="/checkin"
          >
            <Navigate to="/dashboard/admin" replace />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
