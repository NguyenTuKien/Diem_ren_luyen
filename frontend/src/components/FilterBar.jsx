function FilterBar() {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <label
          className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1"
          htmlFor="event-name-filter"
        >
          Tên sự kiện
        </label>
        <input
          className="w-full border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-lg focus:ring-primary focus:border-primary text-sm"
          id="event-name-filter"
          placeholder="Nhập tên sự kiện..."
          type="text"
        />
      </div>

      <div className="flex-1 min-w-[200px]">
        <label
          className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1"
          htmlFor="organizer-filter"
        >
          Ban tổ chức
        </label>
        <select
          className="w-full border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-lg focus:ring-primary focus:border-primary text-sm"
          id="organizer-filter"
        >
          <option>Tất cả ban tổ chức</option>
          <option>Khoa CNTT</option>
          <option>CLB Kỹ năng</option>
          <option>Phòng Đào tạo</option>
        </select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label
          className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1"
          htmlFor="time-filter"
        >
          Thời gian
        </label>
        <input
          className="w-full border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-lg focus:ring-primary focus:border-primary text-sm"
          id="time-filter"
          type="date"
        />
      </div>

      <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2">
        <span className="material-symbols-outlined text-lg">filter_list</span>
        Lọc
      </button>
    </div>
  )
}

export default FilterBar