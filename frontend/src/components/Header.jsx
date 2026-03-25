import { useNavigate } from 'react-router-dom'
import { logout } from '../api/authApi'

function Header() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary/50 text-sm"
            placeholder="Tìm kiếm sự kiện..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full" />
        </button>

        <button
          className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors"
          onClick={handleLogout}
          type="button"
        >
          <span className="material-symbols-outlined text-slate-500">logout</span>
          <span className="text-sm font-medium">Đăng xuất</span>
        </button>
      </div>
    </header>
  )
}

export default Header