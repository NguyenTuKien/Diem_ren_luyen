export default function LecturerTopHeader({ onLogout }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 md:ml-64 md:px-8">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">search</span>
          <input
            type="text"
            className="h-10 w-full rounded-lg border-0 bg-slate-100 pl-10 pr-4 text-sm text-slate-700 focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:text-slate-100"
            placeholder="Tim kiem su kien, sinh vien..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <span className="material-symbols-outlined">mail</span>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="hidden h-8 w-px bg-slate-200 dark:bg-slate-800 md:block" />
        <div className="hidden text-right md:block">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">He thong quan ly</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Hoc ky I - 2023-2024</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
          title="Dang xuat"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>
  );
}
