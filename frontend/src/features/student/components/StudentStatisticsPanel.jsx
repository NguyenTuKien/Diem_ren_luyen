import { useAuth } from "../../../context/AuthContext";
import { useStudentScoreTrend } from "../hooks/useStudentScoreTrend";

function toSafeScore(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
        return 0;
    }
    return Math.max(0, Math.min(100, numeric));
}

function compareLabel(current, previous) {
    if (previous == null) {
        return "Kỳ đầu tiên";
    }
    const delta = current - previous;
    if (delta > 0) {
        return `Tăng +${delta.toFixed(1)} điểm`;
    }
    if (delta < 0) {
        return `Giảm ${delta.toFixed(1)} điểm`;
    }
    return "Không thay đổi";
}

export default function StudentStatisticsPanel() {
    const { user } = useAuth();
    const { trend, loading, error } = useStudentScoreTrend(user?.userId);

    if (loading) {
        return <div className="p-6 text-slate-500">Đang tải thống kê cá nhân...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500">Lỗi: {error}</div>;
    }

    const semesters = Array.isArray(trend) ? trend : [];
    const latest = semesters[semesters.length - 1];
    const previous = semesters.length >= 2 ? semesters[semesters.length - 2] : null;
    const latestScore = latest ? toSafeScore(latest.finalScore) : 0;
    const previousScore = previous ? toSafeScore(previous.finalScore) : null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 p-6 w-full max-w-5xl">
            <div className="mb-6 border-b border-slate-100 dark:border-slate-700/50 pb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Thống kê điểm rèn luyện cá nhân</h2>
                <p className="text-sm text-slate-500 mt-1">
                    So sánh điểm rèn luyện của bạn theo từng học kỳ để theo dõi xu hướng tăng/giảm.
                </p>
            </div>

            {semesters.length === 0 ? (
                <div className="py-14 text-center text-slate-500">Chưa có dữ liệu thống kê theo học kỳ.</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <article className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                            <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Học kỳ gần nhất</p>
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{latest?.semesterName || "--"}</h3>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{latestScore.toFixed(1)} / 100</p>
                            <p className="text-xs text-slate-500 mt-1">{latest?.rankLabel || "Chưa xếp loại"}</p>
                        </article>

                        <article className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                            <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">So sánh với kỳ trước</p>
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{previous?.semesterName || "Chưa có kỳ trước"}</h3>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                                {previousScore == null ? "--" : `${previousScore.toFixed(1)} / 100`}
                            </p>
                            <p className="text-xs mt-1 text-slate-500">{compareLabel(latestScore, previousScore)}</p>
                        </article>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Biểu đồ so sánh theo học kỳ</h3>
                        <div className="space-y-3">
                            {semesters.map((item, index) => {
                                const score = toSafeScore(item.finalScore);
                                const prevScore = index > 0 ? toSafeScore(semesters[index - 1]?.finalScore) : null;
                                const compare = compareLabel(score, prevScore);

                                return (
                                    <div key={`${item.semesterId}-${item.semesterName}`}>
                                        <div className="flex items-center justify-between gap-2 text-xs mb-1">
                                            <span className="font-medium text-slate-600 dark:text-slate-300">{item.semesterName || "Học kỳ"}</span>
                                            <span className="text-slate-500">{score.toFixed(1)} / 100</span>
                                        </div>
                                        <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                            <span
                                                className="block h-full rounded-full"
                                                style={{
                                                    width: `${score}%`,
                                                    background: "linear-gradient(90deg, #2563eb, #22c55e)",
                                                }}
                                            />
                                        </div>
                                        <p className="text-[11px] text-slate-500 mt-1">{compare}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
