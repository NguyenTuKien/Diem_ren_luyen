function EventStats({ onCreateEvent }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Danh sách sự kiện</h2>
        <p className="text-slate-500 mt-1">
          Quản lý và theo dõi các hoạt động sự kiện sắp tới.
        </p>
      </div>

      <button
<<<<<<< HEAD:frontend/src/shared/components/EventStats.jsx
        className="bg-[#d23232] hover:bg-[#d23232]/90 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#d23232]/20"
=======
        className="bg-[#d23232] hover:bg-[#d23232]/90 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
>>>>>>> origin/TOAN:frontend/src/components/EventStats.jsx
        onClick={onCreateEvent}
      >
        <span className="material-symbols-outlined">add_circle</span>
        Tạo sự kiện mới
      </button>
    </div>
  )
}

export default EventStats