export default function AdminMobileNav({ activeFeature, onSelect, onLogout }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-primary/10 flex justify-around py-2 z-50">
      <button
        type="button"
        onClick={() => onSelect("dashboard")}
        className={`flex flex-col items-center gap-1 ${activeFeature === "dashboard" ? "text-primary" : "text-slate-400"}`}
      >
        <span className="material-symbols-outlined">dashboard</span>
        <span className="text-[10px] font-medium">Tổng quan</span>
      </button>
      <button type="button" onClick={onLogout} className="flex flex-col items-center gap-1 text-slate-400">
        <span className="material-symbols-outlined">logout</span>
        <span className="text-[10px] font-medium">Đăng xuất</span>
      </button>
    </div>
  );
}

