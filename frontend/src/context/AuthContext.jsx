/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";

export const AUTH_STORAGE_KEY = "drl_auth";
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
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("refreshToken");
    return null;
  }
}

function clearLegacyTokens() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem("accessToken");
  window.localStorage.removeItem("refreshToken");
}

const ROLE_DASHBOARD = {
  ROLE_ADMIN: "/admin",
  ROLE_LECTURER: "/lecturer",
  ROLE_MONITOR: "/lecturer",
  ROLE_STUDENT: "/student",
  // short names (in case backend strips prefix)
  ADMIN: "/admin",
  LECTURER: "/lecturer",
  MONITOR: "/lecturer",
  STUDENT: "/student",
};

function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function toUser(payload, accessToken) {
  const jwtPayload = decodeJwtPayload(accessToken);
  const resolvedRole = payload.effectiveRole ?? payload.role ?? jwtPayload?.role ?? "";
  const normalizedRole = String(resolvedRole || "").replace(/^ROLE_/, "");
  const resolvedUserId = payload.userId ?? payload.id ?? payload.user_id ?? null;
  const resolvedBackendUserId =
    payload.backendUserId ??
    jwtPayload?.lecture_id ??
    jwtPayload?.student_id ??
    payload.id ??
    payload.user_id ??
    null;
  const resolvedDisplayName =
    payload.displayName ??
    payload.fullName ??
    payload.fullname ??
    payload.username ??
    jwtPayload?.fullname ??
    "";

  return {
    userId: resolvedUserId,
    backendUserId: resolvedBackendUserId,
    email: payload.email,
    role: payload.role ?? resolvedRole,
    effectiveRole: resolvedRole,
    displayName: resolvedDisplayName,
    dashboardPath:
      normalizedRole === "MONITOR"
        ? "/student"
        : payload.dashboardPath ??
        ROLE_DASHBOARD[resolvedRole] ??
        ROLE_DASHBOARD[payload.role] ??
        "/student",
    classCode: payload.classCode,
    status: payload.status,
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const stored = readStoredSession();
    if (!stored?.user) {
      return stored;
    }

    const normalizedUser = toUser(stored.user, stored.accessToken);
    if (JSON.stringify(normalizedUser) === JSON.stringify(stored.user)) {
      return stored;
    }

    return { ...stored, user: normalizedUser };
  });

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

    clearLegacyTokens();
  };

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      refreshToken: session?.refreshToken ?? null,
      login: (payload) => {
        const nextSession = {
          user: toUser(payload, payload.accessToken),
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
