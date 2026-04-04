import { useLecturerEvaluation } from "./useLecturerEvaluation";

function formatStatusLabel(status) {
  switch (String(status || "").toUpperCase()) {
    case "NOT_SUBMITTED":
      return "Chua nop";
    case "SUBMITTED":
      return "Da nop";
    case "MONITOR_APPROVED":
      return "Monitor da duyet";
    case "LECTURER_APPROVED":
      return "Giang vien da duyet";
    case "FINALIZED":
      return "Da chot";
    default:
      return "Khong xac dinh";
  }
}

function formatFieldLabel(key) {
  return String(key || "")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function LecturerReviewModal({
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

  const keys = Object.keys(reviewDraft || {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Duyet phieu danh gia</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            Dong
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-5 py-4">
          {loadingDetail ? (
            <p className="text-sm text-slate-500">Dang tai chi tiet phieu...</p>
          ) : null}

          {!loadingDetail && keys.length === 0 ? (
            <p className="text-sm text-slate-500">Khong co tieu chi de duyet.</p>
          ) : null}

          {!loadingDetail && keys.length > 0 ? (
            <div className="space-y-3">
              {keys.map((key) => (
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
            Huy
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting || loadingDetail}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Dang luu..." : "Xac nhan duyet"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LecturerEvaluationBoard({ lecturerId }) {
  const {
    classOptions,
    semesterOptions,
    selectedClassId,
    selectedSemesterId,
    setSelectedClassId,
    setSelectedSemesterId,
    evaluationRows,
    selectedEvaluation,
    reviewDraft,
    loadingFilters,
    loadingList,
    loadingDetail,
    submittingReview,
    finalizing,
    error,
    successMessage,
    summary,
    openReview,
    closeReview,
    updateReviewScore,
    submitReview,
    finalizeClass,
    refreshList,
  } = useLecturerEvaluation(lecturerId);

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Lecturer evaluation board</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Loc theo lop hoc va hoc ky de duyet tung phieu, sau do chot diem toan lop.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              value={selectedClassId ?? ""}
              onChange={(event) => setSelectedClassId(Number(event.target.value))}
              disabled={loadingFilters || loadingList}
            >
              {classOptions.map((classOption) => (
                <option key={classOption.id} value={classOption.id}>
                  {classOption.label}
                </option>
              ))}
            </select>

            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              value={selectedSemesterId ?? ""}
              onChange={(event) => setSelectedSemesterId(Number(event.target.value))}
              disabled={loadingFilters || loadingList}
            >
              {semesterOptions.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.name || `Hoc ky ${semester.id}`}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={refreshList}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              disabled={loadingList || loadingFilters}
            >
              Tai lai
            </button>

            <button
              type="button"
              onClick={finalizeClass}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              disabled={finalizing || loadingFilters || !selectedClassId || !selectedSemesterId}
            >
              {finalizing ? "Dang chot..." : "Chot diem"}
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-500">Tong phieu</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{summary.total}</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-500">Da duyet</p>
            <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.reviewed}</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-500">Da chot</p>
            <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summary.finalized}</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-500">Diem TB</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{summary.average}</p>
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
          <table className="w-full min-w-[860px] divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Code</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Self</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Monitor</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Current</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loadingFilters || loadingList ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                    Dang tai du lieu danh gia...
                  </td>
                </tr>
              ) : null}

              {!loadingFilters && !loadingList && evaluationRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                    Khong co phieu nao phu hop bo loc hien tai.
                  </td>
                </tr>
              ) : null}

              {!loadingFilters &&
                !loadingList &&
                evaluationRows.map((row) => (
                  <tr key={row.evaluationId || `${row.studentId}-${row.studentCode}`}>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {row.studentName || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{row.studentCode || "-"}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600 dark:text-slate-300">{row.selfScore ?? 0}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600 dark:text-slate-300">{row.monitorScore ?? 0}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {row.currentScore ?? row.finalScore ?? row.lecturerScore ?? 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {formatStatusLabel(row.status)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openReview(row.evaluationId)}
                        disabled={!row.evaluationId || finalizing}
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Duyet
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <LecturerReviewModal
        open={Boolean(selectedEvaluation)}
        loadingDetail={loadingDetail}
        submitting={submittingReview}
        reviewDraft={reviewDraft}
        onChangeScore={updateReviewScore}
        onClose={closeReview}
        onSubmit={submitReview}
      />
    </section>
  );
}