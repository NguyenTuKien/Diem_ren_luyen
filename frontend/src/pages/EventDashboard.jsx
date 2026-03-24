import { useState, useEffect, useMemo, useCallback } from 'react'
import Layout from '../components/Layout'
import EventStats from '../components/EventStats'
import FilterBar from '../components/FilterBar'
import EventTable from '../components/EventTable'
import CreateEventModal from '../components/CreateEventModal'
import { eventApi } from '../api/eventApi'

const toComparableText = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

const toLocalDateInputValue = (dateTime) => {
  const date = new Date(dateTime)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const PAGE_SIZE = 10

function EventDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [pagination, setPagination] = useState({
    page: 0,
    size: PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  })
  const [filters, setFilters] = useState({
    name: '',
    organizer: '',
    date: ''
  })

  const loadEvents = useCallback(async (page) => {
    try {
      setLoading(true)
      const data = await eventApi.fetchEvents(page, PAGE_SIZE)
      const formattedEvents = data.content.map(backendEvent => {
        const startDate = new Date(backendEvent.startTime)
        const dateStr = startDate.toLocaleDateString('vi-VN')
        const timeStr = startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        
        let statusText = backendEvent.status || 'Chưa bắt đầu'
        let statusClass = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide'
        
        if (statusText === 'Sắp diễn ra' || statusText === 'UPCOMING') {
          statusText = 'Sắp diễn ra'
          statusClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide'
        } else if (statusText === 'Đang diễn ra' || statusText === 'ONGOING') {
          statusText = 'Đang diễn ra'
          statusClass = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide'
        }
        
        return {
          id: backendEvent.id,
          title: backendEvent.title,
          description: backendEvent.description,
          semesterId: backendEvent.semester?.id,
          criteriaId: backendEvent.criteria?.id,
          startTime: backendEvent.startTime,
          endTime: backendEvent.endTime,
          name: backendEvent.title,
          organizer: backendEvent.organizer,
          date: dateStr,
          time: timeStr,
          location: backendEvent.location,
          type: backendEvent.criteria ? backendEvent.criteria.id : '1.1',
          status: statusText,
          statusClassName: statusClass,
          disableEdit: statusText === 'Đang diễn ra',
          rowClassName: statusText === 'Đang diễn ra' ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
        }
      })
      setEvents(formattedEvents)
      setPagination({
        page: data.page,
        size: data.size,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        hasNext: data.hasNext,
        hasPrevious: data.hasPrevious
      })

      if (data.totalPages > 0 && page >= data.totalPages) {
        setCurrentPage(data.totalPages - 1)
      }
    } catch (err) {
      console.error(err)
      setError('Lỗi khi tải dữ liệu sự kiện')
      setEvents([])
      setPagination((prev) => ({
        ...prev,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
      }))
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshCurrentPage = useCallback(() => {
    return loadEvents(currentPage)
  }, [currentPage, loadEvents])

  const handleCreateEvent = () => {
    setEditingEvent(null)
    setIsModalOpen(true)
  }

  const handleEditEvent = (event) => {
    setEditingEvent(event)
    setIsModalOpen(true)
  }

  const organizerOptions = useMemo(() => {
    return [...new Set(events.map((event) => event.organizer).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, 'vi')
    )
  }, [events])

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchedName = !filters.name
        || toComparableText(event.name).includes(toComparableText(filters.name))

      const matchedOrganizer = !filters.organizer || event.organizer === filters.organizer

      const matchedDate = !filters.date
        || toLocalDateInputValue(event.startTime) === filters.date

      return matchedName && matchedOrganizer && matchedDate
    })
  }, [events, filters])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  const handlePageChange = (page) => {
    if (page < 0 || page >= pagination.totalPages || page === currentPage) {
      return
    }
    setCurrentPage(page)
  }

  useEffect(() => {
    loadEvents(currentPage)
  }, [currentPage, loadEvents])

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <Layout>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <EventStats onCreateEvent={handleCreateEvent} />
            <FilterBar
              filters={filters}
              organizerOptions={organizerOptions}
              onFilterChange={handleFilterChange}
            />
            {loading ? (
              <div className="text-center py-10">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">{error}</div>
            ) : (
              <EventTable
                currentPage={currentPage}
                events={filteredEvents}
                onEdit={handleEditEvent}
                onPageChange={handlePageChange}
                onRefresh={refreshCurrentPage}
                pagination={pagination}
              />
            )}
          </div>
        </div>
      </Layout>

      <CreateEventModal
        isOpen={isModalOpen}
        initialEvent={editingEvent}
        onClose={() => {
          setIsModalOpen(false)
          setEditingEvent(null)
        }}
        onSuccess={() => {
          setIsModalOpen(false)
          setEditingEvent(null)
          loadEvents(currentPage)
        }}
      />
    </div>
  )
}

export default EventDashboard