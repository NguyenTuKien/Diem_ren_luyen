import { useCallback, useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { qrcodeApi } from '../../../shared/api/qrcodeApi'

const SCANNER_REGION_ID = 'unipoint-qr-reader'
const IS_PIN_ONLY = false

function resolveScanPayload(decodedText, fallbackEventId) {
  const raw = String(decodedText || '').trim()
  if (!raw) {
    throw new Error('Mã QR không hợp lệ. Vui lòng quét lại.')
  }

  let qrData = raw
  let eventId = null

  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') {
      qrData = parsed.qrData || parsed.qrToken || parsed.token || raw
      if (parsed.eventId != null) {
        eventId = Number(parsed.eventId)
      }
    }
  } catch {
    // Keep raw text when QR content is not JSON.
  }

  if (eventId == null && /^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw)
      const value = Number(url.searchParams.get('eventId'))
      if (Number.isFinite(value) && value > 0) {
        eventId = value
      }
      const tokenFromUrl = url.searchParams.get('qrData') || url.searchParams.get('token')
      if (tokenFromUrl) {
        qrData = tokenFromUrl
      }
    } catch {
      // Ignore URL parse errors.
    }
  }

  if (eventId == null && /^\d+$/.test(raw)) {
    eventId = Number(raw)
  }

  if (eventId == null && fallbackEventId) {
    const fallbackNumber = Number(fallbackEventId)
    if (Number.isFinite(fallbackNumber) && fallbackNumber > 0) {
      eventId = fallbackNumber
    }
  }

  if (eventId == null || !Number.isFinite(eventId) || eventId <= 0) {
    throw new Error('Không đọc được eventId từ mã QR.')
  }

  return { qrData, eventId }
}

const handleCheckinSubmit = async ({ qrData, eventId }) => {
  const response = await qrcodeApi.scanQRCode({ qrData, eventId })
  return {
    success: true,
    message: response.message || 'Điểm danh thành công'
  }
}

function QRScanner() {
  const [activeTab, setActiveTab] = useState('qr') // 'qr' | 'evidence'

  // QR Scanner States
  const [permissionStatus, setPermissionStatus] = useState('idle')
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [notice, setNotice] = useState({ type: '', message: '' })
  const [toastMessage, setToastMessage] = useState('')
  const [scanCompleted, setScanCompleted] = useState(false)
  const [pinDigits, setPinDigits] = useState(() => Array(6).fill(''))
  const toastTimerRef = useRef(null)
  const pinInputRefs = useRef([])

  const scannerRef = useRef(null)
  const scanLockRef = useRef(false)
  const fallbackEventId = ''

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
      } catch {
        // Ignore clear errors
      }
      scannerRef.current = null
    }

    setIsScanning(false)
  }, [])

  const handleCheckinSuccess = useCallback((message) => {
    setNotice({ type: 'success', message })
    setToastMessage('Điểm danh thành công')
    setScanCompleted(true)

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
    }
    toastTimerRef.current = setTimeout(() => setToastMessage(''), 3500)
  }, [])

  const handleCheckinError = useCallback((error) => {
    if (error?.status === 403) {
      setNotice({
        type: 'error',
        message: 'Thiết bị này đã được sử dụng để điểm danh cho sự kiện này!'
      })
    } else {
      setNotice({ type: 'error', message: error?.message || 'Mã không hợp lệ hoặc đã hết hạn.' })
    }
    scanLockRef.current = false
  }, [])

  const processCheckin = useCallback(async (scanPayload) => {
    setIsProcessing(true)
    setNotice({ type: '', message: '' })

    try {
      const result = await handleCheckinSubmit(scanPayload)
      handleCheckinSuccess(result.message)
    } catch (error) {
      handleCheckinError(error)
    } finally {
      setIsProcessing(false)
    }
  }, [handleCheckinError, handleCheckinSuccess])

  const onScanSuccess = useCallback(async (decodedText) => {
    if (scanLockRef.current || isProcessing || scanCompleted) {
      return
    }

    scanLockRef.current = true

    await stopScanner()
    try {
      const payload = resolveScanPayload(decodedText, fallbackEventId)
      await processCheckin({ ...payload })
    } catch (error) {
      setNotice({ type: 'error', message: error.message || 'Mã QR không hợp lệ hoặc đã hết hạn.' })
      scanLockRef.current = false
    }
  }, [fallbackEventId, isProcessing, processCheckin, scanCompleted, stopScanner])

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

  useEffect(() => () => {
    stopScanner()
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
    }
  }, [stopScanner])

  const handlePinSubmit = useCallback(async () => {
    const pinCode = pinDigits.join('')
    if (pinCode.length < 6) {
      setNotice({ type: 'error', message: 'Mã PIN phải đủ 6 chữ số.' })
      return
    }

    setIsProcessing(true)
    setNotice({ type: '', message: '' })

    try {
      await stopScanner()
      const response = await qrcodeApi.checkinByCode({ pinCode })
      handleCheckinSuccess(response.message || 'Điểm danh thành công')
    } catch (error) {
      handleCheckinError(error)
    } finally {
      setIsProcessing(false)
    }
  }, [handleCheckinError, handleCheckinSuccess, pinDigits, stopScanner])

  const handleResetQRTab = async () => {
    setPinDigits(Array(6).fill(''))
    setScanCompleted(false)
    setNotice({ type: '', message: '' })
    scanLockRef.current = false
    if (permissionStatus === 'granted') {
      await startScanner()
    }
  }

  const updatePinDigits = (index, value) => {
    const nextDigits = [...pinDigits]
    nextDigits[index] = value
    setPinDigits(nextDigits)
  }

  const handlePinInputChange = (index, rawValue) => {
    const cleaned = rawValue.replace(/\D/g, '')
    if (!cleaned) {
      updatePinDigits(index, '')
      return
    }

    if (cleaned.length === 1) {
      updatePinDigits(index, cleaned)
      if (index < 5) {
        pinInputRefs.current[index + 1]?.focus()
      }
      return
    }

    const chars = cleaned.split('')
    const nextDigits = [...pinDigits]
    let cursor = index
    chars.forEach((char) => {
      if (cursor <= 5) {
        nextDigits[cursor] = char
        cursor += 1
      }
    })
    setPinDigits(nextDigits)
    if (cursor <= 5) {
      pinInputRefs.current[cursor]?.focus()
    }
  }

  const handlePinInputKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus()
    }
  }

  useEffect(() => {
    const pinCode = pinDigits.join('')
    if (pinCode.length === 6 && !isProcessing && !scanCompleted) {
      handlePinSubmit()
    }
  }, [handlePinSubmit, isProcessing, pinDigits, scanCompleted])

  const activeTabClass = "flex-1 py-4 text-sm font-bold border-b-[3px] border-primary text-primary transition-all flex items-center justify-center gap-2"
  const inactiveTabClass = "flex-1 py-4 text-sm font-medium text-slate-500 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 border-b-[3px] border-transparent"

  return (
    <div className="relative flex flex-col text-slate-900 dark:text-slate-100 font-display">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[60] flex items-center gap-3 rounded-lg bg-green-600 text-white px-4 py-3 shadow-lg shadow-green-600/30">
          <span className="material-symbols-outlined">celebration</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex flex-col gap-6">
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
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Nhập mã PIN điểm danh</h3>
                  <p className="text-slate-500 text-sm text-center mb-8">Nhập đúng mã PIN 6 chữ số được cung cấp bởi ban tổ chức.</p>

                  {scanCompleted && notice.type === 'success' && (
                    <div className="w-full mb-6 p-5 rounded-2xl border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-green-600 text-3xl">task_alt</span>
                        <div className="flex-1">
                          <p className="text-base font-bold text-green-800 dark:text-green-300">Điểm danh thành công</p>
                          <p className="text-sm mt-1 text-green-700 dark:text-green-400">{notice.message}</p>
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => {
                                window.location.href = '/student'
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                            >
                              Quay lại Dashboard
                            </button>
                            <button
                              onClick={handleResetQRTab}
                              className="bg-white text-green-700 border border-green-300 px-4 py-2 rounded-lg text-sm font-semibold"
                            >
                              Quét lại
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!IS_PIN_ONLY && (
                    <div className="w-full aspect-square bg-slate-100 dark:bg-slate-900 rounded-2xl relative flex items-center justify-center overflow-hidden border-2 border-dashed border-primary/30 group">
                      {/* html5-qrcode renderer block */}
                      <div
                        id={SCANNER_REGION_ID}
                        className={`absolute inset-0 z-0 [&>div]:!h-full [&>div]:!w-full [&_video]:!h-full [&_video]:!w-full [&_video]:!object-cover ${isScanning ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                      />

                      {!isScanning && !scanCompleted && (
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
                  )}

                  {/* Notice Block beneath Scanner */}
                  {notice.message && notice.type === 'error' && (
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
                      <button
                        onClick={handleResetQRTab}
                        className={notice.type === 'success' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}
                      >
                        <span className="material-symbols-outlined text-sm">refresh</span>
                      </button>
                    </div>
                  )}

                  {!scanCompleted && !isScanning && !notice.message && (
                    <div className="w-full mt-10">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nhập mã PIN</span>
                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-center gap-2">
                          {pinDigits.map((digit, index) => (
                            <input
                              key={index}
                              type="text"
                              inputMode="numeric"
                              pattern="\d*"
                              maxLength={1}
                              ref={(el) => {
                                pinInputRefs.current[index] = el
                              }}
                              className="w-12 h-12 text-center text-lg font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                              value={digit}
                              onChange={(e) => handlePinInputChange(index, e.target.value)}
                              onKeyDown={(e) => handlePinInputKeyDown(index, e)}
                              disabled={isProcessing}
                            />
                          ))}
                        </div>
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
      </div>
    </div>
  )
}

export default QRScanner
