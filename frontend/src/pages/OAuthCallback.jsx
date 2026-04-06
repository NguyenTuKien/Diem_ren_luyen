import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: contextLogin } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const deviceToken = params.get('deviceToken');
    const error = params.get('error');

    if (error) {
      console.error('OAuth Error:', error);
      navigate(`/auth?error=${encodeURIComponent(error)}`, { replace: true });
      return;
    }

    if (accessToken && refreshToken) {
      fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((userPayload) => {
          if (userPayload) {
            contextLogin({
              ...userPayload,
              accessToken,
              refreshToken,
              deviceToken,
            });
            navigate('/', { replace: true });
          } else {
            navigate('/auth?error=Không+thể+lấy+thông+tin+tài+khoản', { replace: true });
          }
        })
        .catch(() => {
          navigate('/auth?error=Lỗi+xác+thực', { replace: true });
        });
    } else {
      navigate('/auth?error=Missing%20OAuth%20tokens', { replace: true });
    }
  }, [location, navigate, contextLogin]);

  return (
    <div className="flex justify-center mt-[50px]">
      <h2>Đang xác thực...</h2>
    </div>
  );
};

export default OAuthCallback;
