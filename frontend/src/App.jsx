import { Routes, Route } from 'react-router-dom';
import EventDashboard from './pages/EventDashboard';
import Login from './pages/Login';
import OAuthCallback from './pages/OAuthCallback';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/oauth-success" element={<OAuthCallback />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <EventDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
