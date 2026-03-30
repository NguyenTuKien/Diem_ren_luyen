import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { fetchCurrentUser, getStoredUserInfo, logout } from '../shared/api/authApi'
import { qrcodeApi } from '../shared/api/qrcodeApi'

const SCANNER_REGION_ID = 'unipoint-qr-reader'

const handleCheckinSubmit = async (qrData, pinCode = null) => {
  if (!qrData && !pinCode) {
    throw new Error('Vui lòng cung cấp mã QR hoặc mã PIN.')
  }

  if (qrData) {
    const response = await qrcodeApi.scanQRCode(qrData)
    return {
      success: true,
      message: response.message || 'Điểm danh QR thành công!'
    }
  } else if (pinCode) {
    // PIN implementation placeholder
    await new Promise((resolve) => setTimeout(resolve, 800))
    return {
      success: true,
      message: 'Điểm danh bằng PIN thành công!'
    }
  }
}

function QRScannerPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('qr') // 'qr' | 'evidence'

  // QR Scanner States
  const [permissionStatus, setPermissionStatus] = useState('idle')
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [notice, setNotice] = useState({ type: '', message: '' })
  const [toastMessage, setToastMessage] = useState('')
  const [eventId, setEventId] = useState(searchParams.get('eventId') || '')
  const [pinCode, setPinCode] = useState('')
  const toastTimerRef = useRef(null)

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // ignore
    } finally {
      navigate('/login')
    }
  }

  const [userInfo, setUserInfo] = useState(() => getStoredUserInfo())

  useEffect(() => {
    const hydrateUser = async () => {
      const cached = getStoredUserInfo()
      const needsFetch = !cached || !cached.userId || !cached.fullName || !cached.role
      if (!needsFetch) {
        setUserInfo(cached)
        return
      }

      const fetched = await fetchCurrentUser()
      if (fetched) {
        setUserInfo({
          userId: fetched.userId,
          id: fetched.userId,
          fullName: fetched.fullName,
          role: fetched.role,
        })
      }
    }

    hydrateUser()
  }, [])

  const safeUser = {
    fullName: userInfo?.fullName || userInfo?.fullname || 'Sinh Viên',
    userId: userInfo?.userId || userInfo?.id || userInfo?.studentId || 'Chưa cập nhật',
    role: userInfo?.role || 'ROLE_STUDENT',
  }

  const scannerRef = useRef(null)

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop()
      } catch {
        // Ignore stop errors.
      }
    }

    if (scannerRef.current) {
      try {
        scannerRef.current.clear()
      } catch (e) {
        // Ignore clear errors
      }
      scannerRef.current = null
    }

    setIsScanning(false)
  }, [])

  const processCheckin = useCallback(async (qrDataOrEventId, pin = null) => {
    setIsProcessing(true)
    setNotice({ type: '', message: '' })

    try {
      const result = await handleCheckinSubmit(qrDataOrEventId, pin)
      setNotice({ type: 'success', message: result.message })
      setToastMessage('Đã điểm danh thành công!')

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current)
      }
      toastTimerRef.current = setTimeout(() => setToastMessage(''), 3500)
    } catch (error) {
      setNotice({ type: 'error', message: error.message || 'Điểm danh thất bại.' })
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const onScanSuccess = useCallback(async (decodedText) => {
    if (!decodedText) {
      setNotice({ type: 'error', message: 'Mã QR không hợp lệ. Vui lòng quét lại.' })
      return
    }

    await stopScanner()
    processCheckin(decodedText)
  }, [processCheckin, stopScanner])

  const startScanner = useCallback(async () => {
    try {
      setNotice({ type: '', message: '' })
      const scanner = new Html5Qrcode(SCANNER_REGION_ID)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          aspectRatio: 1,
        },
        onScanSuccess,
        () => undefined,
      )

      setIsScanning(true)
      setPermissionStatus('granted')
    } catch {
      setPermissionStatus('denied')
      setNotice({
        type: 'error',
        message: 'Không mở được camera. Vui lòng cấp quyền camera và thử lại.',
      })
    }
  }, [onScanSuccess])

  const requestCameraAccess = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })

      stream.getTracks().forEach((track) => track.stop())
      setPermissionStatus('granted')
      await startScanner()
    } catch {
      setPermissionStatus('denied')
      setNotice({
        type: 'error',
        message: 'Bạn chưa cấp quyền camera. Hãy bật quyền trong trình duyệt.',
      })
    }
  }, [startScanner])

  useEffect(() => {
    if (eventId) {
      processCheckin(eventId)
    }
  }, [eventId, processCheckin])

  useEffect(() => () => {
    stopScanner()
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
    }
  }, [stopScanner])

  const handlePinSubmit = () => {
    if (!pinCode.trim() || pinCode.length < 6) {
      setNotice({ type: 'error', message: 'Mã PIN không hợp lệ' })
      return
    }
    processCheckin(null, pinCode)
  }

  const handleResetQRTab = async () => {
    setEventId('')
    setPinCode('')
    setNotice({ type: '', message: '' })
    if (permissionStatus === 'granted') {
      await startScanner()
    }
  }

  const activeTabClass = "flex-1 py-4 text-sm font-bold border-b-[3px] border-primary text-primary transition-all flex items-center justify-center gap-2"
  const inactiveTabClass = "flex-1 py-4 text-sm font-medium text-slate-500 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 border-b-[3px] border-transparent"

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[60] flex items-center gap-3 rounded-lg bg-green-600 text-white px-4 py-3 shadow-lg shadow-green-600/30">
          <span className="material-symbols-outlined">celebration</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-primary/10 bg-white dark:bg-background-dark px-6 md:px-10 py-3 sticky top-0 z-50">
          <div className="flex items-center gap-4 text-primary">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined">school</span>
            </div>
            <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">Điểm rèn luyện</h2>
          </div>
          <div className="flex flex-1 justify-end gap-4 md:gap-8 items-center">
            <nav className="hidden md:flex items-center gap-9">
              <a className="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors" href="#">Trang chủ</a>
              <a className="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors" href="#">Sự kiện</a>
              <a className="text-slate-900 dark:text-slate-100 text-sm font-bold border-b-2 border-primary" href="#">Hoạt động</a>
            </nav>
            <div className="flex gap-2">
              <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button
                title="Đăng xuất"
                onClick={handleLogout}
                className="flex items-center justify-center rounded-lg h-10 w-10 bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <main className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 md:p-8 gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-primary/10 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-3">
                  <span className="material-symbols-outlined text-4xl">person</span>
                </div>
                <h1 className="text-slate-900 dark:text-slate-100 text-base font-bold">{safeUser.fullName}</h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">{safeUser.userId}</p>
                <div className="mt-4 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold">
                  85 Điểm rèn luyện
                </div>
              </div>
            </div>
            <nav className="flex flex-col gap-1">
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 transition-colors" href="#">
                <span className="material-symbols-outlined">dashboard</span>
                <span className="text-sm font-medium">Tổng quan</span>
              </a>
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-white shadow-md" href="#">
                <span className="material-symbols-outlined">qr_code_scanner</span>
                <span className="text-sm font-medium">Điểm danh & Minh chứng</span>
              </a>
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 transition-colors" href="#">
                <span className="material-symbols-outlined">description</span>
                <span className="text-sm font-medium">Lịch sử hoạt động</span>
              </a>
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 transition-colors" href="#">
                <span className="material-symbols-outlined">settings</span>
                <span className="text-sm font-medium">Cài đặt hồ sơ</span>
              </a>
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 mt-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                <span className="material-symbols-outlined">logout</span>
                <span className="text-sm font-medium">Đăng xuất</span>
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-primary/10">
                <button
                  onClick={() => setActiveTab('qr')}
                  className={activeTab === 'qr' ? activeTabClass : inactiveTabClass}
                >
                  <span className="material-symbols-outlined">qr_code</span> Điểm danh QR
                </button>
                <button
                  onClick={() => setActiveTab('evidence')}
                  className={activeTab === 'evidence' ? activeTabClass : inactiveTabClass}
                >
                  <span className="material-symbols-outlined">verified</span> Khai báo minh chứng
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 md:p-10">
                {activeTab === 'qr' && (
                  <div className="flex flex-col items-center max-w-md mx-auto animate-fade-in" id="tab-qr">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Quét mã sự kiện</h3>
                    <p className="text-slate-500 text-sm text-center mb-8">Vui lòng quét mã QR tại sự kiện hoặc nhập mã PIN được cung cấp bởi ban tổ chức.</p>

                    {/* QR Scanner Frame Container */}
                    <div className="w-full aspect-square bg-slate-100 dark:bg-slate-900 rounded-2xl relative flex items-center justify-center overflow-hidden border-2 border-dashed border-primary/30 group">

                      {/* html5-qrcode renderer block */}
                      <div
                        id={SCANNER_REGION_ID}
                        className={`absolute inset-0 z-0 [&>div]:!h-full [&>div]:!w-full [&_video]:!h-full [&_video]:!w-full [&_video]:!object-cover ${isScanning ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                      />

                      {!isScanning && (
                        <>
                          <div
                            className="absolute inset-0 bg-cover bg-center opacity-50 transition-transform group-hover:scale-110"
                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80')" }}
                          />
                          <div className="relative z-10 size-48 border-2 border-primary rounded-xl flex items-center justify-center bg-black/40 backdrop-blur-sm">
                            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary"></div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary"></div>
                            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary"></div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary"></div>
                            <span className="material-symbols-outlined text-primary text-6xl opacity-70">qr_code_2</span>
                          </div>

                          <div className="absolute bottom-4 left-0 right-0 text-center z-10">
                            <button
                              onClick={requestCameraAccess}
                              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg transition-all"
                            >
                              Bắt đầu quét
                            </button>
                          </div>
                        </>
                      )}

                      {isScanning && !isProcessing && (
                        <div className="absolute top-4 right-4 z-20">
                          <button onClick={stopScanner} className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur transition-all flex items-center justify-center">
                            <span className="material-symbols-outlined text-lg">close</span>
                          </button>
                        </div>
                      )}

                      {/* Scanning frame overlay */}
                      {isScanning && (
                        <div className="absolute inset-0 pointer-events-none z-10">
                          <div className="w-full h-full p-8 flex items-center justify-center relative">
                            <div className="w-full max-w-[240px] aspect-square relative shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary/80"></div>
                              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary/80"></div>
                              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary/80"></div>
                              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary/80"></div>
                              {isProcessing && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg backdrop-blur-sm">
                                  <span className="material-symbols-outlined animate-spin text-white text-4xl">sync</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Notice Block beneath Scanner */}
                    {notice.message && (
                      <div className={`w-full mt-4 p-4 border rounded-lg flex items-start gap-3 ${notice.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                        <span className={`material-symbols-outlined shrink-0 mt-0.5 ${notice.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {notice.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${notice.type === 'success' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                            {notice.type === 'success' ? 'Thành công!' : 'Lỗi!'}
                          </p>
                          <p className={`text-xs mt-1 ${notice.type === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                            {notice.message}
                          </p>
                        </div>
                        {notice.type === 'error' && (
                          <button onClick={handleResetQRTab} className="text-red-800 dark:text-red-300">
                            <span className="material-symbols-outlined text-sm">refresh</span>
                          </button>
                        )}
                        {notice.type === 'success' && (
                          <button onClick={handleResetQRTab} className="text-green-800 dark:text-green-300">
                            <span className="material-symbols-outlined text-sm">refresh</span>
                          </button>
                        )}
                      </div>
                    )}

                    {!eventId && !isScanning && !notice.message && (
                      <div className="w-full mt-10">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hoặc nhập mã PIN</span>
                          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                            placeholder="Nhập mã PIN (6 ký tự)"
                            value={pinCode}
                            onChange={(e) => setPinCode(e.target.value)}
                            disabled={isProcessing}
                          />
                          <button
                            className="bg-primary/10 text-primary px-6 py-3 rounded-lg font-bold text-sm hover:bg-primary/20 transition-all disabled:opacity-50"
                            onClick={handlePinSubmit}
                            disabled={isProcessing}
                          >
                            Xác nhận
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'evidence' && (
                  <div className="animate-fade-in" id="tab-evidence">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Khai báo minh chứng sự kiện ngoài</h3>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10" onSubmit={(e) => e.preventDefault()}>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Loại sự kiện</label>
                        <select className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none">
                          <option>Tình nguyện</option>
                          <option>Hội thảo & Tọa đàm</option>
                          <option>Cuộc thi học thuật</option>
                          <option>Hoạt động thể thao</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tên minh chứng</label>
                        <input className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Ví dụ: Giấy chứng nhận Mùa hè xanh" type="text" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Thời gian diễn ra</label>
                        <input className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none" type="date" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Đường dẫn minh chứng (URL/File)</label>
                        <div className="flex gap-2">
                          <input className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="https://drive.google.com/..." type="text" />
                          <button className="bg-slate-200 dark:bg-slate-700 p-3 rounded-lg flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors" type="button">
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">upload_file</span>
                          </button>
                        </div>
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        <button className="bg-primary text-white px-8 py-3 rounded-lg font-bold text-sm shadow-md hover:opacity-90 transition-all">Gửi yêu cầu xét duyệt</button>
                      </div>
                    </form>

                    <div className="border-t border-primary/10 pt-8">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider">Danh sách minh chứng đã gửi</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                          <thead>
                            <tr className="text-slate-500 dark:text-slate-400 text-xs font-bold border-b border-primary/5">
                              <th className="py-3 px-4 w-32">Ngày gửi</th>
                              <th className="py-3 px-4">Tên minh chứng</th>
                              <th className="py-3 px-4 w-32">Loại</th>
                              <th className="py-3 px-4 w-32">Trạng thái</th>
                              <th className="py-3 px-4 w-24 text-right">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            <tr className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                              <td className="py-4 px-4 whitespace-nowrap">12/10/2023</td>
                              <td className="py-4 px-4 font-medium">Giấy khen SV 5 tốt</td>
                              <td className="py-4 px-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded text-[10px] font-bold">Học thuật</span></td>
                              <td className="py-4 px-4">
                                <span className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400 font-bold text-xs whitespace-nowrap">
                                  <span className="size-2 bg-yellow-500 rounded-full animate-pulse"></span> Chờ duyệt
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <button className="text-primary hover:underline font-medium text-xs">Chi tiết</button>
                              </td>
                            </tr>
                            <tr className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                              <td className="py-4 px-4 whitespace-nowrap">05/09/2023</td>
                              <td className="py-4 px-4 font-medium">Chiến dịch Mùa hè xanh</td>
                              <td className="py-4 px-4"><span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded text-[10px] font-bold">Tình nguyện</span></td>
                              <td className="py-4 px-4">
                                <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-bold text-xs whitespace-nowrap">
                                  <span className="size-2 bg-green-500 rounded-full"></span> Đã duyệt
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <button className="text-primary hover:underline font-medium text-xs">Chi tiết</button>
                              </td>
                            </tr>
                            <tr className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                              <td className="py-4 px-4 whitespace-nowrap">20/08/2023</td>
                              <td className="py-4 px-4 font-medium">Hiến máu nhân đạo</td>
                              <td className="py-4 px-4"><span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded text-[10px] font-bold">Xã hội</span></td>
                              <td className="py-4 px-4">
                                <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold text-xs whitespace-nowrap">
                                  <span className="size-2 bg-red-500 rounded-full"></span> Từ chối
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <button className="text-primary hover:underline font-medium text-xs">Chi tiết</button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-auto py-6 text-center text-slate-500 dark:text-slate-400 text-xs border-t border-primary/5">
          <p>© 2024 Cổng thông tin Sinh viên. Tất cả quyền được bảo lưu.</p>
        </footer>
      </div>
    </div>
  )
}

export default QRScannerPage
