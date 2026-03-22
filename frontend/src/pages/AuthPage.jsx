import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/http";
import { useAuth } from "../context/AuthContext";

const DEFAULT_REGISTER = {
  username: "",
  email: "",
  password: "",
  fullName: "",
  studentCode: "",
  classId: "",
};

const DEFAULT_LOGIN = {
  email: "",
  password: "",
};

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [mode, setMode] = useState("login");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginForm, setLoginForm] = useState(DEFAULT_LOGIN);
  const [registerForm, setRegisterForm] = useState(DEFAULT_REGISTER);

  useEffect(() => {
    if (user?.dashboardPath) {
      navigate(user.dashboardPath, { replace: true });
    }
  }, [navigate, user]);

  useEffect(() => {
    let ignore = false;
    apiRequest("/auth/classes")
      .then((res) => {
        if (!ignore) {
          setClasses(res || []);
        }
      })
      .catch(() => {
        if (!ignore) {
          setClasses([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const selectedClass = useMemo(
    () => classes.find((item) => String(item.id) === String(registerForm.classId)),
    [classes, registerForm.classId],
  );

  const applyAuthSuccess = (payload) => {
    login(payload);
    navigate(payload.dashboardPath, { replace: true });
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
      });
      applyAuthSuccess(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitRegister = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          ...registerForm,
          classId: Number(registerForm.classId),
        }),
      });
      applyAuthSuccess(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loginBySso = async (provider) => {
    setError("");
    if (!loginForm.email) {
      setError("Nhập email để đăng nhập bằng SSO.");
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
      applyAuthSuccess(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <header className="auth-header">
          <div className="brand-mark">
            <span className="brand-dot" />
            <span>EduPoint</span>
          </div>
          <div className="auth-top-links">
            <button type="button" className="ghost-btn">
              Trợ giúp
            </button>
            <button type="button" className="solid-btn">
              Liên hệ
            </button>
          </div>
        </header>

        <main className="auth-main-card">
          <h1>Chào mừng trở lại</h1>
          <p>Tiếp tục hành trình tri thức cùng UniPoint</p>

          <div className="auth-switch">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => setMode("register")}
            >
              Đăng ký
            </button>
          </div>

          {error && <div className="form-error">{error}</div>}

          {mode === "login" ? (
            <form className="auth-form" onSubmit={submitLogin}>
              <label>
                Email công việc
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="name@edupoint.edu.vn"
                  required
                />
              </label>
              <label>
                Mật khẩu
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  placeholder="******"
                  required
                />
              </label>
              <button className="submit-btn" disabled={loading} type="submit">
                {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
              </button>

              <div className="auth-divider">Hoặc tiếp tục với</div>
              <div className="sso-row">
                <button
                  type="button"
                  className="sso-btn"
                  disabled={loading}
                  onClick={() => loginBySso("GOOGLE")}
                >
                  Google
                </button>
                <button
                  type="button"
                  className="sso-btn"
                  disabled={loading}
                  onClick={() => loginBySso("MICROSOFT")}
                >
                  Microsoft
                </button>
              </div>
            </form>
          ) : (
            <form className="auth-form" onSubmit={submitRegister}>
              <label>
                Họ và tên
                <input
                  value={registerForm.fullName}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, fullName: event.target.value }))
                  }
                  placeholder="Nguyễn Văn A"
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
                  placeholder="SV001"
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
                  placeholder="sv001@unipoint.edu.vn"
                  required
                />
              </label>
              <label>
                Username (tùy chọn)
                <input
                  value={registerForm.username}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, username: event.target.value }))
                  }
                  placeholder="sv001"
                />
              </label>
              <label>
                Lớp
                <select
                  value={registerForm.classId}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, classId: event.target.value }))
                  }
                  required
                >
                  <option value="">Chọn lớp</option>
                  {classes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.classCode} - {item.facultyCode}
                    </option>
                  ))}
                </select>
              </label>
              {selectedClass && (
                <small className="hint-text">
                  {selectedClass.facultyName} ({selectedClass.facultyCode})
                </small>
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
                  required
                />
              </label>
              <button className="submit-btn" disabled={loading} type="submit">
                {loading ? "Đang xử lý..." : "Tạo tài khoản"}
              </button>
            </form>
          )}
        </main>

        <footer className="auth-footer">2026 UniPoint Ecosystem</footer>
      </div>
    </div>
  );
}
