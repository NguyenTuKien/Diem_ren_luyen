import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  refreshTokens,
  setTokens,
} from './authApi';

let refreshPromise = null;

const redirectToLogin = () => {
  const currentPath = window.location.pathname;
  if (currentPath !== '/login' && currentPath !== '/oauth-success') {
    window.location.href = '/login?error=SessionExpired';
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
  let accessToken = getAccessToken();
  let response = await fetch(url, {
    ...options,
    headers: buildHeaders(options.headers, accessToken),
  });

  if (response.status !== 401) {
    return response;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    redirectToLogin();
    return response;
  }

  try {
    if (!refreshPromise) {
      refreshPromise = refreshTokens(refreshToken)
        .then((newTokens) => {
          setTokens(newTokens);
          return newTokens;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    await refreshPromise;
    accessToken = getAccessToken();

    response = await fetch(url, {
      ...options,
      headers: buildHeaders(options.headers, accessToken),
    });

    if (response.status === 401) {
      clearTokens();
      redirectToLogin();
    }

    return response;
  } catch {
    clearTokens();
    redirectToLogin();
    return response;
  }
};
