export default function AdminMobileNav({ items, activeFeature, onSelect, onLogout }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const isActive = activeFeature === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 transition-colors ${isActive ? "text-primary" : "text-slate-400"}`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="text-[10px] font-semibold leading-none">{item.label}</span>
            </button>
          );
        })}

        <button type="button" onClick={onLogout} className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-slate-400 transition-colors">
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="text-[10px] font-semibold leading-none">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}

