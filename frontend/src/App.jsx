import { Routes, Route } from 'react-router-dom';
import EventDashboard from './pages/EventDashboard';
import Login from './pages/Login';
import OAuthCallback from './pages/OAuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import StudentEvaluationForm from './components/evaluation/StudentEvaluationForm';
import EvaluationClassList from './components/evaluation/EvaluationClassList';
import EvaluationReviewForm from './components/evaluation/EvaluationReviewForm';
import SemesterRouteWrapper from './components/evaluation/SemesterRouteWrapper';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/oauth-success" element={<OAuthCallback />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <EventDashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="/student/evaluation" element={<ProtectedRoute requiredRole="ROLE_STUDENT"><SemesterRouteWrapper><StudentEvaluationForm /></SemesterRouteWrapper></ProtectedRoute>} />
      <Route path="/monitor/evaluation" element={<ProtectedRoute requiredRole="ROLE_MONITOR"><SemesterRouteWrapper><EvaluationClassList /></SemesterRouteWrapper></ProtectedRoute>} />
      <Route path="/monitor/evaluation/:id" element={<ProtectedRoute requiredRole="ROLE_MONITOR"><EvaluationReviewForm /></ProtectedRoute>} />
      <Route path="/lecturer/evaluation" element={<ProtectedRoute requiredRole="ROLE_LECTURER"><SemesterRouteWrapper><EvaluationClassList isLecturer={true} /></SemesterRouteWrapper></ProtectedRoute>} />
      <Route path="/lecturer/evaluation/:id" element={<ProtectedRoute requiredRole="ROLE_LECTURER"><EvaluationReviewForm isLecturer={true} /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
