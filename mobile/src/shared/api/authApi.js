const AUTH_API_BASE = '/api/v1/auth';
const USER_INFO_KEY = 'currentUserInfo';

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

const storeUserInfo = (raw) => {
  if (!raw) return null;

  const normalized = {
    id: raw.id ?? raw.userId ?? null,
    userId: raw.userId ?? raw.id ?? null,
    fullName: raw.fullName ?? raw.fullname ?? raw.name ?? '',
    role: raw.role ?? '',
  };

  if (normalized.id || normalized.role) {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(normalized));
    return normalized;
  }

  return null;
};

const storeUserFromAccessToken = (accessToken) => {
  const payload = decodeJwtPayload(accessToken);
  if (!payload) return null;

  return storeUserInfo({
    id: payload.userId ?? payload.id,
    userId: payload.userId ?? payload.id,
    fullName: payload.fullname ?? payload.fullName ?? payload.name,
    role: payload.role,
  });
};

export const getStoredUserInfo = () => {
  const raw = localStorage.getItem(USER_INFO_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getAccessToken = () => localStorage.getItem('accessToken');

export const getRefreshToken = () => localStorage.getItem('refreshToken');

export const setTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    storeUserFromAccessToken(accessToken);
  }
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem(USER_INFO_KEY);
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

  const data = await response.json();
  storeUserInfo(data);
  return data;
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
