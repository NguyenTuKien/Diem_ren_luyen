import { refreshTokens } from './authApi';
import { AUTH_STORAGE_KEY } from '../../context/AuthContext';

const LEGACY_AUTH_STORAGE_KEY = 'unipoint_auth';

let refreshPromise = null;

// Read from the single AuthContext session store
function getSessionTokens() {
  try {
    const raw =
      window.localStorage.getItem(AUTH_STORAGE_KEY)
      || window.localStorage.getItem(LEGACY_AUTH_STORAGE_KEY);
    if (!raw) return { accessToken: null, refreshToken: null };
    const parsed = JSON.parse(raw);
    return {
      accessToken: parsed?.accessToken ?? null,
      refreshToken: parsed?.refreshToken ?? null,
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

// Merge new tokens back into the session store (preserves user info)
function patchSessionTokens({ accessToken, refreshToken }) {
  try {
    const raw =
      window.localStorage.getItem(AUTH_STORAGE_KEY)
      || window.localStorage.getItem(LEGACY_AUTH_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : {};
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      ...existing,
      accessToken: accessToken ?? existing.accessToken,
      refreshToken: refreshToken ?? existing.refreshToken,
    }));
    window.localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function clearSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
}

const redirectToLogin = () => {
  const currentPath = window.location.pathname;
  if (currentPath !== '/auth' && currentPath !== '/oauth-success') {
    window.location.href = '/auth?error=SessionExpired';
  }
};

const buildHeaders = (optionsHeaders, token) => {
  const headers = new Headers(optionsHeaders || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
};

export const authFetch = async (url, options = {}) => {
  let { accessToken, refreshToken } = getSessionTokens();

  let response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: buildHeaders(options.headers, accessToken),
  });

  if (response.status !== 401) {
    return response;
  }

  if (!refreshToken) {
    clearSession();
    redirectToLogin();
    return response;
  }

  try {
    if (!refreshPromise) {
      refreshPromise = refreshTokens(refreshToken)
        .then((newTokens) => {
          patchSessionTokens(newTokens);
          return newTokens;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const newTokens = await refreshPromise;
    accessToken = newTokens?.accessToken ?? getSessionTokens().accessToken;

    response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: buildHeaders(options.headers, accessToken),
    });

    if (response.status === 401) {
      clearSession();
      redirectToLogin();
    }

    return response;
  } catch {
    clearSession();
    redirectToLogin();
    return response;
  }
};
