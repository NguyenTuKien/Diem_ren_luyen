function Pagination() {
  return (
    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
      <span className="text-sm text-slate-500">Hiển thị 1-3 của 12 sự kiện</span>
      <div className="flex gap-2">
        <button className="px-3 py-1 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-sm disabled:opacity-50">
          Trước
        </button>
        <button
          className="px-3 py-1 text-sm bg-[#d23232] text-white rounded shadow-sm"
        >
          1
        </button>
        <button className="px-3 py-1 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-sm">
          2
        </button>
        <button className="px-3 py-1 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-sm">
          Tiếp
        </button>
      </div>
    </div>
  )
}

export default Pagination