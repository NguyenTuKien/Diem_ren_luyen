/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";

export const AUTH_STORAGE_KEY = "unipoint_auth";
const AuthContext = createContext(null);

function readStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.user) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function syncLegacyTokens(session) {
  if (typeof window === "undefined") {
    return;
  }

  if (session?.accessToken) {
    window.localStorage.setItem("accessToken", session.accessToken);
  } else {
    window.localStorage.removeItem("accessToken");
  }

  if (session?.refreshToken) {
    window.localStorage.setItem("refreshToken", session.refreshToken);
  } else {
    window.localStorage.removeItem("refreshToken");
  }
}

function toUser(payload) {
  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    effectiveRole: payload.effectiveRole,
    displayName: payload.displayName,
    dashboardPath: payload.dashboardPath,
    classCode: payload.classCode,
    status: payload.status,
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);

  const persistSession = (nextSession) => {
    setSession(nextSession);

    if (typeof window === "undefined") {
      return;
    }

    if (nextSession) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    syncLegacyTokens(nextSession);
  };

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      refreshToken: session?.refreshToken ?? null,
      login: (payload) => {
        const nextSession = {
          user: toUser(payload),
          accessToken: payload.accessToken ?? null,
          refreshToken: payload.refreshToken ?? null,
        };
        persistSession(nextSession);
      },
      logout: () => {
        persistSession(null);
      },
    }),
    [session],
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
