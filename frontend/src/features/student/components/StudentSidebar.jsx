export default function StudentSidebar({ items, activeFeature, onSelect }) {
  return (
    <aside className="w-full md:w-64 border-r border-primary/5 bg-white dark:bg-background-dark/30 p-4 hidden md:flex flex-col gap-2">
      {items.map((item) => {
        const isActive = activeFeature === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect(item.key)}
            className={
              isActive
                ? "flex items-center gap-3 px-3 py-3 rounded-lg bg-primary text-white"
                : "flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary transition-all"
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <p className="text-sm font-medium">{item.label}</p>
            {item.badge ? (
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {item.badge}
              </span>
            ) : null}
          </button>
        );
      })}

      <div className="mt-auto p-4 bg-primary/5 rounded-xl border border-primary/10">
        <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-bold">Hỗ trợ</p>
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-sm">help</span>
          <span className="text-xs font-medium">Trung tâm trợ giúp</span>
        </div>
      </div>
    </aside>
  );
}
