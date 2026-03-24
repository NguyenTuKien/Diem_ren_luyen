import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import EventStats from '../components/EventStats'
import FilterBar from '../components/FilterBar'
import EventTable from '../components/EventTable'
import CreateEventModal from '../components/CreateEventModal'
import { eventApi } from '../api/eventApi'

function EventDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadEvents = async () => {
    try {
      setLoading(true)
      const data = await eventApi.fetchEvents(0, 100)
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
    } catch (err) {
      console.error(err)
      setError('Lỗi khi tải dữ liệu sự kiện')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = () => {
    setEditingEvent(null)
    setIsModalOpen(true)
  }

  const handleEditEvent = (event) => {
    setEditingEvent(event)
    setIsModalOpen(true)
  }

  useEffect(() => {
    loadEvents()
  }, [])

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <Layout>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <EventStats onCreateEvent={handleCreateEvent} />
            <FilterBar />
            {loading ? (
              <div className="text-center py-10">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">{error}</div>
            ) : (
              <EventTable events={events} onRefresh={loadEvents} onEdit={handleEditEvent} />
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
          loadEvents()
        }}
      />
    </div>
  )
}

export default EventDashboard