import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'

const SCANNER_REGION_ID = 'unipoint-qr-reader'

const parseEventIdFromQr = (decodedText) => {
  try {
    const parsedUrl = new URL(decodedText)
    return parsedUrl.searchParams.get('eventId')
  } catch {
    const matched = decodedText.match(/[?&]eventId=([^&]+)/i)
    return matched ? decodeURIComponent(matched[1]) : null
  }
}

const handleCheckinSubmit = async (eventId) => {
  await new Promise((resolve) => setTimeout(resolve, 1300))

  if (!eventId) {
    throw new Error('Không tìm thấy eventId hợp lệ để điểm danh.')
  }

  return {
    success: true,
    message: `Điểm danh thành công cho sự kiện #${eventId}.`,
  }
}

function QRScannerPage() {
  const [searchParams] = useSearchParams()
  const [permissionStatus, setPermissionStatus] = useState('idle')
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [notice, setNotice] = useState({ type: '', message: '' })
  const [decodedContent, setDecodedContent] = useState('')
  const [eventId, setEventId] = useState(searchParams.get('eventId') || '')

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
      await scannerRef.current.clear().catch(() => undefined)
      scannerRef.current = null
    }

    setIsScanning(false)
  }, [])

  const processCheckin = useCallback(async (resolvedEventId) => {
    setIsProcessing(true)
    setNotice({ type: '', message: '' })

    try {
      const result = await handleCheckinSubmit(resolvedEventId)
      setNotice({ type: 'success', message: result.message })
    } catch (error) {
      setNotice({ type: 'error', message: error.message || 'Điểm danh thất bại.' })
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const onScanSuccess = useCallback(async (decodedText) => {
    setDecodedContent(decodedText)
    const extractedEventId = parseEventIdFromQr(decodedText)

    if (!extractedEventId) {
      setNotice({ type: 'error', message: 'QR không chứa eventId hợp lệ. Vui lòng quét lại.' })
      return
    }

    setEventId(extractedEventId)
    await stopScanner()
    processCheckin(extractedEventId)
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
          qrbox: { width: 240, height: 240 },
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
  }, [stopScanner])

  const canRetryScan = !isScanning && !isProcessing

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quét mã QR điểm danh</h1>
        <p className="text-sm text-slate-500 mt-1">
          Đưa mã QR vào khung vuông để hệ thống nhận diện sự kiện và gửi điểm danh.
        </p>

        {notice.message && (
          <div
            className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${notice.type === 'success'
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              : 'bg-red-100 text-red-700 border border-red-200'}`}
            role="alert"
          >
            {notice.message}
          </div>
        )}

        {isProcessing && (
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 px-4 py-3 text-sm font-medium">
            Đang xử lý điểm danh...
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <div className="relative w-full max-w-[320px] aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden bg-black/5 dark:bg-slate-800">
            <div id={SCANNER_REGION_ID} className="h-full w-full" />
            {!isScanning && !eventId && (
              <div className="absolute inset-0 grid place-items-center text-center p-4 text-slate-500 text-sm">
                Camera chưa hoạt động
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {permissionStatus !== 'granted' && !eventId && (
            <button
              type="button"
              className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-white font-semibold hover:opacity-95 transition-opacity"
              onClick={requestCameraAccess}
              disabled={isProcessing}
            >
              Cho phép truy cập Camera
            </button>
          )}

          {permissionStatus === 'granted' && canRetryScan && !eventId && (
            <button
              type="button"
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-slate-700 dark:text-slate-100 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={startScanner}
            >
              Quét lại
            </button>
          )}

          {!!eventId && (
            <button
              type="button"
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-slate-700 dark:text-slate-100 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={async () => {
                setEventId('')
                setDecodedContent('')
                setNotice({ type: '', message: '' })
                await startScanner()
              }}
              disabled={isProcessing}
            >
              Quét mã khác
            </button>
          )}
        </div>

        {decodedContent && (
          <div className="mt-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Dữ liệu QR</p>
            <p className="text-sm break-all text-slate-700 dark:text-slate-200">{decodedContent}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default QRScannerPage
