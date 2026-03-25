<<<<<<< HEAD
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
=======
﻿import App from "./app/App";
>>>>>>> 5f6b687e64570063f6f6e8eb6ff7f9e390eb9956

export default App;
