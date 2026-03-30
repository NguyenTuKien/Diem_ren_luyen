import { Navigate, Routes, Route } from 'react-router-dom';
import AuthLoginPages from './pages/AuthLoginPage'
import OAuthCallback from './pages/OAuthCallback'
import ProtectedRouter from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthLoginPages />} />
      <Route path="/oauth-success" element={<OAuthCallback />} />
      <Route path="/*" element={<ProtectedRouter />} />
    </Routes>
  );
}

export default App;
