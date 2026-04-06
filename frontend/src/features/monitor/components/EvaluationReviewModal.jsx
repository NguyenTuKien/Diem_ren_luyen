function formatFieldLabel(key) {
  return String(key || "")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function EvaluationReviewModal({
  open,
  loadingDetail,
  submitting,
  reviewDraft,
  onChangeScore,
  onClose,
  onSubmit,
}) {
  if (!open) {
    return null;
  }

  const detailKeys = Object.keys(reviewDraft || {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Review phiếu đánh giá</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            Đóng
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-5 py-4">
          {loadingDetail ? (
            <p className="text-sm text-slate-500">Đang tải chi tiết phiếu...</p>
          ) : null}

          {!loadingDetail && detailKeys.length === 0 ? (
            <p className="text-sm text-slate-500">Không có tiêu chí để review.</p>
          ) : null}

          {!loadingDetail && detailKeys.length > 0 ? (
            <div className="space-y-3">
              {detailKeys.map((key) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
                >
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{formatFieldLabel(key)}</p>
                  <input
                    type="number"
                    min={0}
                    value={reviewDraft[key] ?? 0}
                    onChange={(event) => onChangeScore(key, event.target.value)}
                    disabled={submitting}
                    className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right text-sm font-semibold text-slate-900 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting || loadingDetail}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Đang lưu..." : "Lưu review"}
          </button>
        </div>
      </div>
    </div>
  );
}
