import { useState, useEffect } from 'react'
import { eventApi } from '../api/eventApi'
import { criteriaApi } from '../api/criteriaApi'
import { semesterApi } from '../api/semesterApi'

const toDateTimeLocal = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function CreateEventModal({ isOpen, onClose, onSuccess, initialEvent = null }) {
  const isEditMode = Boolean(initialEvent?.id)

  const [formData, setFormData] = useState({
    title: '',
    organizer: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    semesterId: '',
    criteriaId: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [criterias, setCriterias] = useState([])
  const [semesters, setSemesters] = useState([])

  const resetForm = () => {
    setFormData({
      title: '',
      organizer: '',
      description: '',
      startTime: '',
      endTime: '',
      location: '',
      semesterId: '',
      criteriaId: ''
    })
    setError('')
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setError('')

        const [criteriaData, semesterData] = await Promise.all([
          criteriaApi.fetchCriterias(),
          semesterApi.fetchSemesters()
        ])
        setCriterias(criteriaData);
        setSemesters(semesterData);

        if (isEditMode) {
          setFormData({
            title: initialEvent.title || '',
            organizer: initialEvent.organizer || '',
            description: initialEvent.description || '',
            startTime: toDateTimeLocal(initialEvent.startTime),
            endTime: toDateTimeLocal(initialEvent.endTime),
            location: initialEvent.location || '',
            semesterId: initialEvent.semesterId ? String(initialEvent.semesterId) : (semesterData[0] ? String(semesterData[0].id) : ''),
            criteriaId: initialEvent.criteriaId ? String(initialEvent.criteriaId) : (criteriaData[0] ? String(criteriaData[0].id) : '')
          })
        } else {
          setFormData(prev => ({
            ...prev,
            criteriaId: criteriaData.length > 0 ? String(criteriaData[0].id) : '',
            semesterId: semesterData.length > 0 ? String(semesterData[0].id) : ''
          }));
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setError('Không tải được dữ liệu học kỳ/tiêu chí.');
      }
    };
    if (isOpen) {
      loadData();
    } else {
      resetForm()
    }
  }, [isOpen]);

  if (!isOpen) {
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim() || !formData.location.trim()) {
      setError('Vui lòng nhập đầy đủ tên sự kiện và địa điểm.')
      return
    }

    if (!formData.semesterId || !formData.criteriaId) {
      setError('Vui lòng chọn học kỳ và tiêu chí đánh giá.')
      return
    }

    if (!formData.startTime || !formData.endTime) {
      setError('Vui lòng nhập thời gian bắt đầu và kết thúc.')
      return
    }

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      setError('Thời gian kết thúc phải sau thời gian bắt đầu.')
      return
    }

    const payload = {
      title: formData.title.trim(),
      organizer: formData.organizer || null,
      description: formData.description.trim() || null,
      location: formData.location.trim(),
      semesterId: Number(formData.semesterId),
      criteriaId: Number(formData.criteriaId),
      startTime: formData.startTime,
      endTime: formData.endTime,
    }

    try {
      setLoading(true)
      if (isEditMode) {
        await eventApi.updateEvent(initialEvent.id, payload)
      } else {
        await eventApi.createEvent(payload)
      }
      if (onSuccess) onSuccess()
      resetForm()
    } catch (err) {
      console.error(err)
      setError(err.message || (isEditMode ? 'Lỗi khi cập nhật sự kiện' : 'Lỗi khi tạo sự kiện'))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { id, value } = e.target
    const fieldMap = {
      'event-name': 'title',
      'event-organizer': 'organizer',
      'event-criteria': 'criteriaId',
      'event-semester': 'semesterId',
      'event-description': 'description',
      'event-start-time': 'startTime',
      'event-end-time': 'endTime',
      'event-location': 'location'
    }
    const field = fieldMap[id]
    if (field) {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">{isEditMode ? 'Cập nhật sự kiện' : 'Tạo sự kiện mới'}</h3>
            <p className="text-sm text-slate-500 mt-1">
              {isEditMode ? 'Chỉnh sửa thông tin sự kiện.' : 'Điền các thông tin cần thiết bên dưới.'}
            </p>
          </div>
          <button
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            onClick={handleClose}
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className="p-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                htmlFor="event-name"
              >
                Tên sự kiện <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border-slate-200 dark:border-slate-800 dark:bg-slate-800 rounded-lg focus:ring-primary focus:border-primary px-4 py-2.5"
                id="event-name"
                placeholder="Ví dụ: Hội thảo Phát triển Kỹ năng số"
                type="text"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                htmlFor="event-organizer"
              >
                Ban tổ chức <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border-slate-200 dark:border-slate-800 dark:bg-slate-800 rounded-lg focus:ring-primary focus:border-primary px-4 py-2.5"
                id="event-organizer"
                value={formData.organizer}
                onChange={handleChange}
              >
                <option value="">Chọn đơn vị tổ chức</option>
                <option>Khoa CNTT</option>
                <option>CLB Kỹ năng</option>
                <option>Phòng Đào tạo</option>
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                htmlFor="event-semester"
              >
                Học kỳ <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border-slate-200 dark:border-slate-800 dark:bg-slate-800 rounded-lg focus:ring-primary focus:border-primary px-4 py-2.5"
                id="event-semester"
                value={formData.semesterId}
                onChange={handleChange}
              >
                <option value="">Chọn học kỳ</option>
                {semesters.map(semester => (
                  <option key={semester.id} value={semester.id}>{semester.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                htmlFor="event-criteria"
              >
                Tiêu chí đánh giá <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border-slate-200 dark:border-slate-800 dark:bg-slate-800 rounded-lg focus:ring-primary focus:border-primary px-4 py-2.5"
                id="event-criteria"
                value={formData.criteriaId}
                onChange={handleChange}
              >
                <option value="">Chọn tiêu chí</option>
                {criterias.map(criteria => (
                  <option key={criteria.id} value={criteria.id}>{criteria.code} - {criteria.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                htmlFor="event-description"
              >
                Mô tả sự kiện
              </label>
              <textarea
                className="w-full border-slate-200 dark:border-slate-800 dark:bg-slate-800 rounded-lg focus:ring-primary focus:border-primary px-4 py-2.5"
                id="event-description"
                placeholder="Mô tả nội dung chính của sự kiện..."
                rows="3"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                htmlFor="event-start-time"
              >
                Thời gian bắt đầu
              </label>
              <input
                className="w-full border-slate-200 dark:border-slate-800 dark:bg-slate-800 rounded-lg focus:ring-primary focus:border-primary px-4 py-2.5"
                id="event-start-time"
                type="datetime-local"
                value={formData.startTime}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                htmlFor="event-end-time"
              >
                Thời gian kết thúc
              </label>
              <input
                className="w-full border-slate-200 dark:border-slate-800 dark:bg-slate-800 rounded-lg focus:ring-primary focus:border-primary px-4 py-2.5"
                id="event-end-time"
                type="datetime-local"
                value={formData.endTime}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <label
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                htmlFor="event-location"
              >
                Địa điểm <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border-slate-200 dark:border-slate-800 dark:bg-slate-800 rounded-lg focus:ring-primary focus:border-primary px-4 py-2.5"
                id="event-location"
                placeholder="Nhập tên phòng hoặc khu vực..."
                type="text"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-6">
            <button
              className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              onClick={handleClose}
              type="button"
            >
              Hủy bỏ
            </button>
            <button
              className="bg-[#d23232] hover:bg-[#d23232]/90 text-white px-8 py-2.5 rounded-lg font-bold shadow-lg shadow-[#d23232]/20 transition-all"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Lưu sự kiện')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateEventModal