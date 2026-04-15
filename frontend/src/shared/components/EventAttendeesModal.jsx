import { useState, useEffect, useCallback } from 'react'
import { eventApi } from '../api/eventApi'

const PAGE_SIZE = 10

function EventAttendeesModal({ event, onClose }) {
  const [attendees, setAttendees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  })

  const loadAttendees = useCallback(async (page) => {
    if (!event?.id) return
    try {
      setLoading(true)
      setError(null)
      const data = await eventApi.fetchEventAttendees(event.id, page, PAGE_SIZE)
      setAttendees(data.content || [])
      setPagination({
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        hasNext: data.hasNext || false,
        hasPrevious: data.hasPrevious || false,
      })
    } catch (err) {
      console.error(err)
      setError('Không thể tải danh sách sinh viên. Vui lòng thử lại.')
      setAttendees([])
    } finally {
      setLoading(false)
    }
  }, [event?.id])

  useEffect(() => {
    loadAttendees(currentPage)
  }, [currentPage, loadAttendees])

  const handlePageChange = (page) => {
    if (page < 0 || page >= pagination.totalPages || page === currentPage) return
    setCurrentPage(page)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const startIndex = currentPage * PAGE_SIZE + 1
  const endIndex = Math.min(startIndex + attendees.length - 1, pagination.totalElements)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
              Danh sách sinh viên đã check-in
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 truncate">
              {event?.name}
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={onClose}
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Stats badge */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
            <span className="material-symbols-outlined text-base text-primary">groups</span>
            Tổng số: <strong className="text-slate-900 dark:text-white">{pagination.totalElements}</strong> sinh viên
          </span>
        </div>

        {/* Table body */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <span className="material-symbols-outlined text-4xl animate-spin mb-3 text-primary">sync</span>
              <span className="text-sm font-medium">Đang tải dữ liệu...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-red-500">
              <span className="material-symbols-outlined text-4xl mb-3">error_outline</span>
              <span className="text-sm font-medium">{error}</span>
              <button
                type="button"
                className="mt-4 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold transition-colors"
                onClick={() => loadAttendees(currentPage)}
              >
                Thử lại
              </button>
            </div>
          ) : attendees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-3">person_off</span>
              <span className="text-sm font-medium">Chưa có sinh viên nào check-in.</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-12">STT</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Mã SV</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Họ và tên</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Lớp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendees.map((attendee, idx) => (
                  <tr
                    key={attendee.studentId}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm text-slate-400 font-medium">
                      {startIndex + idx}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded">
                        {attendee.studentCode}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {attendee.fullName}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">
                      {attendee.className || <span className="text-slate-300 dark:text-slate-600 italic">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination footer */}
        {!loading && !error && pagination.totalPages > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 shrink-0 bg-white dark:bg-slate-900">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {attendees.length > 0
                ? `Hiển thị ${startIndex}–${endIndex} của ${pagination.totalElements} sinh viên`
                : 'Không có dữ liệu'}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={!pagination.hasPrevious}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700
                  hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>

              {(() => {
                const startPage = Math.max(0, currentPage - 2)
                const endPage = Math.min(pagination.totalPages - 1, currentPage + 2)
                const pageButtons = []

                for (let i = startPage; i <= endPage; i += 1) {
                  pageButtons.push(
                    <button
                      key={i}
                      type="button"
                      onClick={() => handlePageChange(i)}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                        i === currentPage
                          ? 'bg-primary text-white shadow-sm'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {i + 1}
                    </button>
                  )
                }

                return pageButtons
              })()}
              <button
                type="button"
                disabled={!pagination.hasNext}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700
                  hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Tiếp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventAttendeesModal
