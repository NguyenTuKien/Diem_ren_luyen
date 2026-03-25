import { AUTH_STORAGE_KEY } from "../../features/auth/context/AuthContext";

const DEFAULT_API_BASE_URL = "/api";
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? DEFAULT_API_BASE_URL;

function getTokenFromStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (parsed?.accessToken) {
      return parsed.accessToken;
    }

    return null;
  } catch {
    // Invalid stored session: clear stale auth data to avoid sending wrong token.
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("refreshToken");
    return null;
  }
}

function buildMessage(payload, status) {
  if (payload && typeof payload === "object") {
    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message;
    }
    if (typeof payload.error === "string" && payload.error.trim()) {
      return payload.error;
    }
  }

  if (status === 401) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  }
  if (status === 403) {
    return "Bạn không có quyền thực hiện thao tác này.";
  }
  if (status === 404) {
    return "Không tìm thấy dữ liệu yêu cầu.";
  }
  if (status === 502 || status === 503 || status === 504) {
    return "Không kết nối được backend. Vui lòng kiểm tra server backend.";
  }
  return `Yêu cầu thất bại (HTTP ${status}). Vui lòng thử lại.`;
}

async function readPayload(response) {
  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();

  if (!raw) {
    return null;
  }

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(raw);
    } catch {
      return { message: raw };
    }
  }

  return { message: raw };
}

export async function apiRequest(path, options = {}) {
  const endpoint = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getTokenFromStorage();

  const headers = {
    Accept: "application/json",
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let response;
  try {
    response = await fetch(url, {
      method: options.method || "GET",
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Không kết nối được backend. Kiểm tra backend đang chạy tại http://localhost:8080.",
    );
  }

  const payload = await readPayload(response);

  if (!response.ok) {
    throw new Error(buildMessage(payload, response.status));
  }

  return payload;
}
