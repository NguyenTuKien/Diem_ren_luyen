function Pagination({ currentPage, totalPages, totalElements, pageSize, onPageChange }) {
  const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1
  const endItem = totalElements === 0 ? 0 : Math.min((currentPage + 1) * pageSize, totalElements)

  const pages = Array.from({ length: totalPages }, (_, index) => index)

  return (
    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
      <span className="text-sm text-slate-500">
        Hiển thị {startItem}-{endItem} của {totalElements} sự kiện
      </span>
      <div className="flex gap-2">
        <button
          className="px-3 py-1 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-sm disabled:opacity-50"
          disabled={currentPage === 0 || totalPages === 0}
          onClick={() => onPageChange(currentPage - 1)}
          type="button"
        >
          Trước
        </button>

        {pages.map((page) => (
          <button
            key={page}
            className={`px-3 py-1 text-sm rounded shadow-sm ${
              page === currentPage
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
            onClick={() => onPageChange(page)}
            type="button"
          >
            {page + 1}
          </button>
        ))}

        <button
          className="px-3 py-1 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-sm disabled:opacity-50"
          disabled={totalPages === 0 || currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          type="button"
        >
          Tiếp
        </button>
      </div>
    </div>
  )
}

export default Pagination