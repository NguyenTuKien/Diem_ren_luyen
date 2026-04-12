export default function StudentMobileNav({ activeFeature, onSelect, onLogout }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-primary/10 flex justify-around py-2 z-50">
      <button
        type="button"
        onClick={() => onSelect("dashboard")}
        className={`flex flex-col items-center gap-1 ${activeFeature === "dashboard" ? "text-primary" : "text-slate-400"}`}
      >
        <span className="material-symbols-outlined">house</span>
        <span className="text-[10px] font-medium">Trang chủ</span>
      </button>
      <button
        type="button"
        onClick={() => onSelect("events")}
        className={`flex flex-col items-center gap-1 ${activeFeature === "events" ? "text-primary" : "text-slate-400"}`}
      >
        <span className="material-symbols-outlined">calendar_today</span>
        <span className="text-[10px] font-medium">Sự kiện</span>
      </button>
      <button
        type="button"
        onClick={() => onSelect("scan-qr")}
        className={`flex flex-col items-center gap-1 ${activeFeature === "scan-qr" ? "text-primary" : "text-slate-400"}`}
      >
        <span className="material-symbols-outlined">qr_code_scanner</span>
        <span className="text-[10px] font-medium">Quét mã</span>
      </button>
      <button
        type="button"
        onClick={() => onSelect("history")}
        className={`flex flex-col items-center gap-1 ${activeFeature === "history" ? "text-primary" : "text-slate-400"}`}
      >
        <span className="material-symbols-outlined">history</span>
        <span className="text-[10px] font-medium">Lịch sử</span>
      </button>
      <button
        type="button"
        onClick={() => onSelect("evaluation")}
        className={`flex flex-col items-center gap-1 ${activeFeature === "evaluation" ? "text-primary" : "text-slate-400"}`}
      >
        <span className="material-symbols-outlined">assignment</span>
        <span className="text-[10px] font-medium">Đánh giá</span>
      </button>
      <button type="button" onClick={onLogout} className="flex flex-col items-center gap-1 text-slate-400">
        <span className="material-symbols-outlined">person</span>
        <span className="text-[10px] font-medium">Cá nhân</span>
      </button>
    </div>
  );
}

