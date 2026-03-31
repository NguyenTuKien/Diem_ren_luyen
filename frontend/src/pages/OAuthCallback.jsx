import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { setTokens } from '../api/authApi';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const error = params.get('error');

    if (error) {
      console.error('OAuth Error:', error);
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
      return;
    }

    if (accessToken && refreshToken) {
      setTokens({ accessToken, refreshToken });
      navigate('/', { replace: true });
    } else {
      navigate('/login?error=Missing%20OAuth%20tokens', { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="flex justify-center mt-[50px]">
      <h2>Authenticating...</h2>
    </div>
  );
};

export default OAuthCallback;
