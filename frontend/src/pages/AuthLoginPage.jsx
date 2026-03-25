import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { login, setTokens, startMicrosoftOAuthLogin } from '../api/authApi';

const LoginHeader = () => (
  <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 px-6 md:px-20 py-4 bg-white dark:bg-slate-900">
    <div className="flex items-center gap-3 text-primary dark:text-slate-100">
      <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
        <span className="material-symbols-outlined text-2xl">school</span>
      </div>
      <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">EduPoint</h2>
    </div>
    <div className="flex gap-4">
      <button className="hidden md:flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 border border-primary/20 text-primary dark:text-slate-100 text-sm font-bold" type="button">
        <span>Trợ giúp</span>
      </button>
      <button className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold" type="button">
        <span>Liên hệ</span>
      </button>
    </div>
  </header>
);

const SocialProviders = ({ onMicrosoftLogin }) => (
  <div className="grid grid-cols-2 gap-4">
    <button className="flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" type="button">
      <img
        alt="Biểu tượng Google cho đăng nhập SSO"
        className="w-5 h-5"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdNzokGUAkT0Dn10wkBObXkpEsslt2BASQWt9jOjKxBd0XjCeC7_pWBim4VdKnyqmBYOnklLe9X-i2EFHRlrFAstthS_FkOKebcCUSmA-m65ejHRNvVeEnK48znjaNDTpdcHhfUQDtbFkxU69anZnJlivTmKykjyIgZbyPawdXSenerKCCyelw--Kvtjc9YAyAcC7-bwnzlYF6knaxzj25BJPbDL1v_OyY-Moho9upeC01UQsxHv3T6neTciURN7-LSHDvNK6QUAUJ"
      />
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Google</span>
    </button>
    <button
      className="flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      onClick={onMicrosoftLogin}
      type="button"
    >
      <svg className="w-5 h-5" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1h10v10H1z" fill="#f35325" />
        <path d="M12 1h10v10H12z" fill="#81bc06" />
        <path d="M1 12h10v10H1z" fill="#05a6f0" />
        <path d="M12 12h10v10H12z" fill="#ffba08" />
      </svg>
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Microsoft</span>
    </button>
  </div>
);

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleMicrosoftLogin = () => {
    startMicrosoftOAuthLogin();
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get('error');
    if (!errorParam) {
      return;
    }

    if (errorParam === 'SessionExpired') {
      setError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
      return;
    }

    setError(decodeURIComponent(errorParam));
  }, [location.search]);

  const handleStandardLogin = async (e) => {
    e.preventDefault();

    if (authMode !== 'login') {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await login({ username, password });
      setTokens(data);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <LoginHeader />

          <main className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-background-dark">
            <div className="w-full max-w-[480px] bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-8 border border-primary/5">
              <div className="text-center mb-8">
                <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-bold leading-tight mb-2">Chào mừng trở lại</h1>
                <p className="text-slate-500 dark:text-slate-400 text-base font-normal">Tiếp tục hành trình tri thức cùng EduPoint</p>
              </div>

              <div className="flex mb-8">
                <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                  <label className="flex cursor-pointer h-full grow items-center justify-center rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-slate-700 has-[:checked]:shadow-sm text-slate-600 dark:text-slate-400 has-[:checked]:text-primary dark:has-[:checked]:text-white text-sm font-semibold transition-all">
                    <span>Đăng nhập</span>
                    <input
                      checked={authMode === 'login'}
                      className="hidden"
                      name="auth-mode"
                      onChange={() => setAuthMode('login')}
                      type="radio"
                      value="login"
                    />
                  </label>
                  <label className="flex cursor-pointer h-full grow items-center justify-center rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-slate-700 has-[:checked]:shadow-sm text-slate-600 dark:text-slate-400 has-[:checked]:text-primary dark:has-[:checked]:text-white text-sm font-semibold transition-all">
                    <span>Đăng ký</span>
                    <input
                      checked={authMode === 'register'}
                      className="hidden"
                      name="auth-mode"
                      onChange={() => setAuthMode('register')}
                      type="radio"
                      value="register"
                    />
                  </label>
                </div>
              </div>

              {error && (
                <div className="mb-5 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleStandardLogin}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tên đăng nhập</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
                    <input
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-white"
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nhập tên đăng nhập"
                      required
                      type="text"
                      value={username}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mật khẩu</label>
                    <a className="text-xs text-[#d23232] dark:text-[#d23232]/80 font-medium hover:underline" href="#">
                      Quên mật khẩu?
                    </a>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                    <input
                      className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-white"
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                    />
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      onClick={() => setShowPassword((prev) => !prev)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                <button
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                  disabled={loading || authMode !== 'login'}
                  type="submit"
                >
                  <span>{loading ? 'Đang đăng nhập...' : 'Đăng nhập ngay'}</span>
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-slate-900 text-slate-500">Hoặc tiếp tục với</span>
                </div>
              </div>

              <SocialProviders onMicrosoftLogin={handleMicrosoftLogin} />

              <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
                Bằng việc tiếp tục, bạn đồng ý với{' '}
                <a className="underline hover:text-[#d23232]" href="#">
                  Điều khoản dịch vụ
                </a>{' '}
                và{' '}
                <a className="underline hover:text-[#d23232]" href="#">
                  Chính sách bảo mật
                </a>{' '}
                của EduPoint.
              </p>
            </div>
          </main>

          <footer className="py-6 text-center text-slate-400 dark:text-slate-500 text-sm">© 2024 EduPoint Ecosystem. All rights reserved.</footer>
        </div>
      </div>
    </div>
  );
};

export default Login;
