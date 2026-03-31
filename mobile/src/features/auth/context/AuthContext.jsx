/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearTokens,
  fetchCurrentUser,
  getAccessToken,
  getRefreshToken,
  getStoredUserInfo,
  logout as logoutApi,
  setTokens,
} from "../../../api/authApi";

const AuthContext = createContext(null);

const toUser = (payload = {}) => ({
  userId: payload.userId ?? payload.id ?? null,
  email: payload.email ?? payload.username ?? null,
  role: payload.role ?? payload.effectiveRole ?? "",
  effectiveRole: payload.effectiveRole ?? payload.role ?? "",
  displayName: payload.displayName ?? payload.fullName ?? payload.fullname ?? payload.name ?? "",
  dashboardPath: payload.dashboardPath ?? "/",
  classCode: payload.classCode ?? payload.class ?? "",
  status: payload.status ?? "",
});

const readSessionFromStorage = async () => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  if (!accessToken || !refreshToken) {
    return null;
  }

  const storedUser = getStoredUserInfo();
  if (storedUser) {
    return { user: toUser(storedUser), accessToken, refreshToken };
  }

  const fetchedUser = await fetchCurrentUser();
  if (!fetchedUser) {
    return null;
  }

  return { user: toUser(fetchedUser), accessToken, refreshToken };
};

export function AuthProvider({ children }) {
  const seedSession = () => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    const storedUser = getStoredUserInfo();

    if (accessToken && refreshToken && storedUser) {
      return {
        loading: false,
        session: { user: toUser(storedUser), accessToken, refreshToken },
      };
    }

    return { loading: true, session: null };
  };

  const [state, setState] = useState(seedSession);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const session = await readSessionFromStorage();
        if (cancelled) return;
        setState({ loading: false, session });
      } catch {
        if (!cancelled) {
          clearTokens();
          setState({ loading: false, session: null });
        }
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const setSessionFromTokens = async (tokens) => {
    setTokens(tokens || {});
    const session = await readSessionFromStorage();
    setState({ loading: false, session });
    return session;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      clearTokens();
      setState({ loading: false, session: null });
    }
  };

  const value = useMemo(
    () => ({
      loading: state.loading,
      session: state.session,
      user: state.session?.user ?? null,
      accessToken: state.session?.accessToken ?? null,
      refreshToken: state.session?.refreshToken ?? null,
      login: setSessionFromTokens,
      logout,
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được dùng trong AuthProvider.");
  }
  return context;
}
