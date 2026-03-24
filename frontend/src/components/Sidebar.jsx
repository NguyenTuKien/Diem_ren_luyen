function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div
          className="bg-primary p-2 rounded-lg text-white"
          style={{ backgroundColor: '#d23232' }}
        >
          <span className="material-symbols-outlined">event_available</span>
        </div>
        <h1
          className="text-xl font-bold tracking-tight text-primary"
          style={{ color: '#d23232' }}
        >
          EventHub
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <div className="p-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
            Chính
          </p>
          <a
            className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined text-xl">dashboard</span>
            <span className="font-medium">Tổng quan</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary rounded-lg transition-colors"
            href="#"
            style={{ backgroundColor: 'rgba(210, 50, 50, 0.1)', color: '#d23232' }}
          >
            <span className="material-symbols-outlined text-xl">calendar_today</span>
            <span className="font-medium">Sự kiện</span>
          </a>
        </div>

        <div className="p-2 pt-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
            Người dùng
          </p>
          <a
            className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined text-xl">group</span>
            <span className="font-medium">Người tham gia</span>
          </a>
          <a
            className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined text-xl">badge</span>
            <span className="font-medium">Ban tổ chức</span>
          </a>
        </div>

        <div className="p-2 pt-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
            Hệ thống
          </p>
          <a
            className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined text-xl">settings</span>
            <span className="font-medium">Cài đặt</span>
          </a>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-primary">account_circle</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold truncate">Admin Panel</p>
            <p className="text-xs text-slate-500 truncate">Quản trị viên</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar