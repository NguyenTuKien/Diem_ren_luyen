const AUTH_API_BASE = '/api/v1/auth';

export const getAccessToken = () => localStorage.getItem('accessToken');

export const getRefreshToken = () => localStorage.getItem('refreshToken');

export const setTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
  }
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const login = async ({ username, password }) => {
  const response = await fetch(`${AUTH_API_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error('Tên đăng nhập hoặc mật khẩu không đúng.');
  }

  return response.json();
};

export const refreshTokens = async (refreshToken) => {
  const response = await fetch(`${AUTH_API_BASE}/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Không thể làm mới phiên đăng nhập.');
  }

  return response.json();
};

export const fetchCurrentUser = async () => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return null;
  }

  const response = await fetch(`${AUTH_API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
};

export const logout = async () => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  try {
    await fetch(`${AUTH_API_BASE}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ refreshToken }),
    });
  } finally {
    clearTokens();
  }
};

export const startMicrosoftOAuthLogin = () => {
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_BASE_URL || '').replace(/\/$/, '');
  const oauthPath = '/api/oauth2/authorization/microsoft';
  window.location.href = backendBaseUrl ? `${backendBaseUrl}${oauthPath}` : oauthPath;
};
