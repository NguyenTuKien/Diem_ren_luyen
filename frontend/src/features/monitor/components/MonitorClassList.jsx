import EvaluationReviewModal from "./EvaluationReviewModal";
import { useMonitorEvaluation } from "../hooks/useMonitorEvaluation";

function formatStatusLabel(status) {
  switch (String(status || "").toUpperCase()) {
    case "NOT_SUBMITTED":
      return "Chưa nộp";
    case "SUBMITTED":
      return "Đã nộp";
    case "MONITOR_APPROVED":
      return "Đã duyệt";
    case "FINALIZED":
      return "Đã chốt";
    default:
      return "Không xác định";
  }
}

export default function MonitorClassList() {
  const {
    semesterOptions,
    selectedSemesterId,
    setSelectedSemesterId,
    evaluationRows,
    loadingSemesters,
    loadingList,
    loadingDetail,
    submittingReview,
    error,
    successMessage,
    selectedEvaluation,
    reviewDraft,
    summary,
    openReviewModal,
    closeReviewModal,
    updateReviewScore,
    submitReview,
    refreshList,
  } = useMonitorEvaluation();

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Monitor evaluation board</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Tổng hợp phiếu theo học kỳ, review từng sinh viên trước khi chuyển cấp giảng viên.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              value={selectedSemesterId ?? ""}
              onChange={(event) => setSelectedSemesterId(Number(event.target.value))}
              disabled={loadingSemesters || loadingList}
            >
              {semesterOptions.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.name || `Học kỳ ${semester.id}`}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={refreshList}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Tải lại
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-500">Tổng phiếu</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{summary.total}</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-500">Chờ review</p>
            <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{summary.submitted}</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-500">Đã duyệt</p>
            <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summary.reviewed}</p>
          </article>
        </div>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800/70 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-950/40 dark:text-emerald-300">
          {successMessage}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Code</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Self score</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Current score</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loadingList ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    Đang tải danh sách phiếu...
                  </td>
                </tr>
              ) : null}

              {!loadingList && evaluationRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    Chưa có phiếu đánh giá trong học kỳ đã chọn.
                  </td>
                </tr>
              ) : null}

              {!loadingList &&
                evaluationRows.map((row) => (
                  <tr key={row.evaluationId || `${row.studentId}-${row.studentCode}`}>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {row.studentName || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{row.studentCode || "-"}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600 dark:text-slate-300">{row.selfScore ?? 0}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {row.currentScore ?? row.monitorScore ?? 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {formatStatusLabel(row.status)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openReviewModal(row.evaluationId)}
                        disabled={!row.evaluationId}
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <EvaluationReviewModal
        open={Boolean(selectedEvaluation)}
        loadingDetail={loadingDetail}
        submitting={submittingReview}
        reviewDraft={reviewDraft}
        onChangeScore={updateReviewScore}
        onClose={closeReviewModal}
        onSubmit={submitReview}
      />
    </section>
  );
}
