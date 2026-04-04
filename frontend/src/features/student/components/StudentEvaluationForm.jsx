import { useMemo } from "react";
import { useStudentEvaluation } from "../hooks/useStudentEvaluation";

function formatStatusLabel(status) {
  switch (String(status || "").toUpperCase()) {
    case "NOT_SUBMITTED":
      return "Chua nop";
    case "DRAFT":
      return "Dang luu nhap";
    case "SUBMITTED":
      return "Da nop";
    case "MONITOR_APPROVED":
      return "Lop truong da duyet";
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

export default function StudentEvaluationForm() {
  const {
    semesterOptions,
    selectedSemesterId,
    setSelectedSemesterId,
    formState,
    detailInputs,
    loadingSemesters,
    loadingForm,
    submitting,
    error,
    successMessage,
    isEditable,
    totalSystemScore,
    totalStudentScore,
    isEventLockedField,
    updateDetailScore,
    submit,
    refresh,
  } = useStudentEvaluation();

  const detailKeys = useMemo(() => Object.keys(detailInputs || {}), [detailInputs]);

  if (loadingSemesters) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        Dang tai danh sach hoc ky...
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Phieu danh gia ren luyen</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Sinh vien tu danh gia theo hoc ky, cac tieu chi su kien duoc he thong khoa de dam bao dong bo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              value={selectedSemesterId ?? ""}
              onChange={(event) => setSelectedSemesterId(Number(event.target.value))}
              disabled={loadingForm || submitting}
            >
              {semesterOptions.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.name || `Hoc ky ${semester.id}`}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={refresh}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              disabled={loadingForm || submitting}
            >
              Tai lai
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-500">Diem he thong</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{totalSystemScore}</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-500">Diem tu danh gia</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{totalStudentScore}</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-500">Trang thai</p>
            <p className="mt-2 text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatStatusLabel(formState.status)}
            </p>
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
          <table className="w-full min-w-[680px] divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tieu chi</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">He thong</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Tu danh gia</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loadingForm ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">
                    Dang tai du lieu phieu...
                  </td>
                </tr>
              ) : null}

              {!loadingForm && detailKeys.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">
                    Chua co tieu chi de danh gia cho hoc ky nay.
                  </td>
                </tr>
              ) : null}

              {!loadingForm &&
                detailKeys.map((key) => {
                  const isLocked = isEventLockedField(key) || !isEditable;
                  return (
                    <tr key={key}>
                      <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                        {formatFieldLabel(key)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600 dark:text-slate-300">
                        {formState.autoScores[key] ?? 0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          min={0}
                          value={detailInputs[key] ?? 0}
                          disabled={isLocked || submitting}
                          onChange={(event) => updateDetailScore(key, event.target.value)}
                          className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:disabled:bg-slate-800"
                        />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:justify-end dark:border-slate-800">
          <button
            type="button"
            onClick={() => submit(true)}
            disabled={!isEditable || submitting || loadingForm}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Luu nhap
          </button>
          <button
            type="button"
            onClick={() => submit(false)}
            disabled={!isEditable || submitting || loadingForm}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Nop phieu
          </button>
        </footer>
      </div>
    </section>
  );
}