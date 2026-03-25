import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, apiRequest } from "../../../shared/api/http";
import { useAuth } from "../context/AuthContext";

const DEFAULT_LOGIN_FORM = {
  email: "",
  password: "",
};

const DEFAULT_REGISTER_FORM = {
  email: "",
  password: "",
  fullName: "",
  studentCode: "",
  classId: "",
};

function resolveDashboardPath(payload) {
  if (payload.dashboardPath) {
    return payload.dashboardPath;
  }

  switch (payload.effectiveRole) {
    case "ADMIN":
      return "/dashboard/admin";
    case "LECTURER":
      return "/dashboard/lecturer/students";
    case "MONITOR":
      return "/dashboard/monitor/class";
    default:
      return "/dashboard/student";
  }
}

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [mode, setMode] = useState("login");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [error, setError] = useState("");
  const [loginForm, setLoginForm] = useState(DEFAULT_LOGIN_FORM);
  const [registerForm, setRegisterForm] = useState(DEFAULT_REGISTER_FORM);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user?.dashboardPath) {
      navigate(user.dashboardPath, { replace: true });
    }
  }, [navigate, user]);

  useEffect(() => {
    let ignore = false;

    async function fetchClasses() {
      setLoadingClasses(true);
      try {
        const data = await apiRequest("/auth/classes");
        if (!ignore) {
          setClasses(Array.isArray(data) ? data : []);
          if (Array.isArray(data) && data.length > 0) {
            setRegisterForm((prev) => ({
              ...prev,
              classId: prev.classId || String(data[0].id),
            }));
          }
        }
      } catch {
        if (!ignore) {
          setClasses([]);
        }
      } finally {
        if (!ignore) {
          setLoadingClasses(false);
        }
      }
    }

    fetchClasses();

    return () => {
      ignore = true;
    };
  }, []);

  const selectedClass = useMemo(
    () => classes.find((item) => String(item.id) === String(registerForm.classId)),
    [classes, registerForm.classId],
  );

  const syncSessionFromServer = async (payload) => {
    if (!payload?.accessToken) {
      return payload;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/session`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${payload.accessToken}`,
        },
      });

      if (!response.ok) {
        return payload;
      }

      const serverPayload = await response.json();
      if (!serverPayload || typeof serverPayload !== "object") {
        return payload;
      }

      return {
        ...payload,
        ...serverPayload,
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
      };
    } catch {
      return payload;
    }
  };

  const applyAuthSuccess = async (payload) => {
    const syncedPayload = await syncSessionFromServer(payload);
    const dashboardPath = resolveDashboardPath(syncedPayload);
    const sessionPayload = {
      ...syncedPayload,
      dashboardPath,
    };
    login(sessionPayload);
    navigate(dashboardPath, { replace: true });
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
      });
      await applyAuthSuccess(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");

    if (!registerForm.classId) {
      setError("Vui lòng chọn lớp trong danh sách có sẵn.");
      return;
    }

    setLoading(true);
    try {
      const payload = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: registerForm.email,
          password: registerForm.password,
          fullName: registerForm.fullName,
          studentCode: registerForm.studentCode,
          classId: Number(registerForm.classId),
        }),
      });
      await applyAuthSuccess(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSsoLogin = async (provider) => {
    setError("");
    if (!loginForm.email.trim()) {
      setError("Vui lòng nhập email để đăng nhập SSO.");
      return;
    }

    setLoading(true);
    try {
      const payload = await apiRequest("/auth/sso", {
        method: "POST",
        body: JSON.stringify({
          email: loginForm.email,
          provider,
        }),
      });
      await applyAuthSuccess(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <header className="auth-topbar">
        <div className="auth-brand">
          <span className="auth-brand-icon">✉</span>
          <span>EduPoint</span>
        </div>
        <div className="auth-top-actions">
          <button type="button" className="btn-outline">
            Trợ giúp
          </button>
          <button type="button" className="btn-danger">
            Liên hệ
          </button>
        </div>
      </header>

      <main className="auth-main">
        <section className="auth-card">
          <h1>Chào mừng trở lại</h1>
          <p>Tiếp tục hành trình tri thức cùng EduPoint</p>

          <div className="auth-tabs" role="tablist" aria-label="Chế độ đăng nhập">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => {
                setMode("register");
                setError("");
              }}
            >
              Đăng ký
            </button>
          </div>

          {error && <div className="alert-error">{error}</div>}

          {mode === "login" ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <label>
                Email công việc
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="name@edupoint.edu.vn"
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                <span className="field-row">
                  <span>Mật khẩu</span>
                  <button type="button" className="text-link">
                    Quên mật khẩu?
                  </button>
                </span>
                <div className="password-row">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                    }
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? "Ẩn" : "Hiện"}
                  </button>
                </div>
              </label>

              <button type="submit" className="btn-danger submit-full" disabled={loading}>
                {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
              </button>

              <div className="auth-divider">Hoặc tiếp tục với</div>
              <div className="auth-social-row">
                <button
                  type="button"
                  className="btn-social"
                  disabled={loading}
                  onClick={() => handleSsoLogin("GOOGLE")}
                >
                  Google
                </button>
                <button
                  type="button"
                  className="btn-social"
                  disabled={loading}
                  onClick={() => handleSsoLogin("MICROSOFT")}
                >
                  Microsoft
                </button>
              </div>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegister}>
              <label>
                Họ và tên
                <input
                  value={registerForm.fullName}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, fullName: event.target.value }))
                  }
                  placeholder="Nguyễn Văn A"
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                Mã sinh viên
                <input
                  value={registerForm.studentCode}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, studentCode: event.target.value }))
                  }
                  placeholder="SV123456"
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="sv@edupoint.edu.vn"
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Lớp
                <select
                  value={registerForm.classId}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, classId: event.target.value }))
                  }
                  disabled={loadingClasses}
                  required
                >
                  <option value="">{loadingClasses ? "Đang tải lớp..." : "Chọn lớp"}</option>
                  {classes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.classCode} - {item.facultyCode}
                    </option>
                  ))}
                </select>
              </label>

              {selectedClass && (
                <small className="field-hint">{selectedClass.facultyName}</small>
              )}

              <label>
                Mật khẩu
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  placeholder="Tối thiểu 6 ký tự"
                  autoComplete="new-password"
                  required
                />
              </label>

              <button type="submit" className="btn-danger submit-full" disabled={loading}>
                {loading ? "Đang xử lý..." : "Tạo tài khoản"}
              </button>
            </form>
          )}

          <p className="auth-policy">
            Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của
            EduPoint.
          </p>
        </section>
      </main>

      <footer className="auth-copyright">© 2026 EduPoint Ecosystem. All rights reserved.</footer>
    </div>
  );
}
