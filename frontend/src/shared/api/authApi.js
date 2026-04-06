import { API_BASE_URL } from './http';
import { getHardwareFingerprint } from '../utils/deviceId';

const AUTH_API_BASE = `${API_BASE_URL}/v1/auth`;
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
  const deviceId = await getHardwareFingerprint();
  const response = await fetch(`${AUTH_API_BASE}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error('Tên đăng nhập hoặc mật khẩu không đúng.');
  }

  return response.json();
};

export const register = async ({ email, password, fullName, studentCode, classId }) => {
  const deviceId = await getHardwareFingerprint();
  const response = await fetch(`${AUTH_API_BASE}/register`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
    },
    body: JSON.stringify({ email, password, fullName, studentCode, classId }),
  });

  if (!response.ok) {
    throw new Error('Không thể đăng ký tài khoản.');
  }

  return response.json();
};

export const loginWithSso = async ({ email, provider }) => {
  const deviceId = await getHardwareFingerprint();
  const response = await fetch(`${AUTH_API_BASE}/sso`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
    },
    body: JSON.stringify({ email, provider }),
  });

  if (!response.ok) {
    throw new Error('Không thể đăng nhập SSO.');
  }

  return response.json();
};

export const refreshTokens = async (refreshToken) => {
  // Fallback: đọc deviceToken từ localStorage để gửi qua header
  // vì cookie Secure không hoạt động trên Chrome Android qua HTTP
  let deviceToken = null;
  try {
    const raw = window.localStorage.getItem('drl_auth');
    if (raw) {
      deviceToken = JSON.parse(raw)?.deviceToken ?? null;
    }
  } catch {
    // ignore
  }

  const headers = { 'Content-Type': 'application/json' };
  if (deviceToken) {
    headers['X-Device-Token'] = deviceToken;
  }

  const response = await fetch(`${AUTH_API_BASE}/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers,
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
    credentials: 'include',
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
      credentials: 'include',
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

/**
 * Logout with explicitly provided tokens (bypasses localStorage).
 * Use this when tokens are stored in a session context, not in localStorage.
 */
export const logoutWithTokens = async (accessToken, refreshToken) => {
  try {
    await fetch(`${AUTH_API_BASE}/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ refreshToken: refreshToken ?? null }),
    });
  } finally {
    clearTokens();
  }
};

export const fetchAuthSession = async (accessToken) => {
  if (!accessToken) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/auth/session`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  return payload && typeof payload === 'object' ? payload : null;
};

export const startMicrosoftOAuthLogin = () => {
  // Luôn dùng API_BASE_URL để đảm bảo đúng domain
  const oauthPath = '/oauth2/authorization/microsoft';
  window.location.href = `${API_BASE_URL}${oauthPath}`;
};
