import React, { useState, useEffect, useCallback } from 'react';
import { evaluationService } from '../../services/evaluationService';

export default function StudentEvaluationForm({ semesterId = 1 }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [evaluationData, setEvaluationData] = useState({
    evaluationId: null,
    status: 'NOT_SUBMITTED',
    finalScore: 0,
    autoScores: {},
    details: {}
  });

  const [studentPoints, setStudentPoints] = useState({
    ACADEMIC_CLUB: 0,
    VOLUNTEER: 0
  });

  const loadFormData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await evaluationService.getStudentForm(semesterId);
      if (res && res.data) {
        setEvaluationData(res.data);
        if (res.data.details) {
          setStudentPoints({
            ACADEMIC_CLUB: res.data.details.ACADEMIC_CLUB || 0,
            VOLUNTEER: res.data.details.VOLUNTEER || 0
          });
        }
      }
    } catch (error) {
      showToast(error.message || 'Lỗi khi tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  }, [semesterId]);

  useEffect(() => {
    loadFormData();
  }, [loadFormData]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePointChange = (key, value, max) => {
    let val = parseInt(value) || 0;
    if (val < 0) val = 0;
    if (val > max) val = max;
    setStudentPoints((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (isDraft = false) => {
    try {
      setSubmitting(true);
      await evaluationService.submitEvaluation({
        semesterId,
        details: studentPoints,
        isDraft
      });
      showToast(isDraft ? 'Đã lưu nháp thành công!' : 'Đã nộp phiếu đánh giá!');
      if (!isDraft) {
        setEvaluationData((prev) => ({ ...prev, status: 'SUBMITTED' }));
      }
    } catch (error) {
      showToast(error.message || 'Lỗi khi nộp phiếu', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotalSystem = () => {
    const autoScores = evaluationData.autoScores || {};
    return Object.values(autoScores).reduce((a, b) => a + (b || 0), 0);
  };

  const calculateTotalStudent = () => {
    return Object.values(studentPoints).reduce((a, b) => a + (b || 0), 0);
  };

  const isEditable = evaluationData.status === 'NOT_SUBMITTED';
  const totalSystem = calculateTotalSystem();
  const totalStudent = calculateTotalStudent();

  const getStatusText = (status) => {
    switch (status) {
      case 'NOT_SUBMITTED': return 'Chưa nộp';
      case 'SUBMITTED': return 'Đã nộp';
      case 'MONITOR_APPROVED': return 'Lớp trưởng đã duyệt';
      case 'FINALIZED': return 'Đã chốt sổ';
      default: return 'Không xác định';
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Đang tải biểu mẫu...</div>;
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-lg shadow-lg text-white font-bold transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.message}
        </div>
      )}

      {/* Top Navigation */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 md:px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-4 text-primary">
          <div className="size-8 flex items-center justify-center bg-primary text-white rounded-lg">
            <span className="material-symbols-outlined">school</span>
          </div>
          <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em]">S-Point Portal</h2>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center justify-center rounded-lg h-10 px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 gap-2 text-sm font-bold hover:bg-slate-200 transition-colors">
            <span className="material-symbols-outlined">account_circle</span>
            <span className="hidden sm:inline">Sinh Viên</span>
          </button>
        </div>
      </header>

      <main className="flex flex-1 justify-center py-8 px-4 md:px-10">
        <div className="flex flex-col max-w-[1000px] flex-1 gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-extrabold tracking-tight">Phiếu đánh giá rèn luyện</h1>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              <p className="text-sm font-medium">Học kỳ {semesterId}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Điểm hệ thống</p>
              <div className="flex items-end gap-1">
                <span className="text-primary text-3xl font-bold">{totalSystem}</span>
                <span className="text-slate-400 pb-1">/100</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(totalSystem, 100)}%` }}></div>
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Điểm tự đánh giá</p>
              <div className="flex items-end gap-1">
                <span className="text-slate-900 dark:text-slate-100 text-3xl font-bold">{totalStudent}</span>
                <span className="text-slate-400 pb-1">/100</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2">
                <div className="bg-slate-300 dark:bg-slate-700 h-2 rounded-full" style={{ width: `${Math.min(totalStudent, 100)}%` }}></div>
              </div>
            </div>

            <div className={`flex flex-col gap-2 rounded-xl p-6 shadow-lg ${isEditable ? 'bg-primary text-white' : 'bg-emerald-600 text-white'}`}>
              <p className="opacity-80 text-sm font-medium">Trạng thái phiếu</p>
              <p className="text-xl font-bold">{getStatusText(evaluationData.status)}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Section I */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold">I. Ý thức học tập (Tối đa 20đ)</h2>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 size-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                      <span className="material-symbols-outlined">grade</span>
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-slate-100 font-semibold">Kết quả học tập</p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Điểm TBHK (Quy đổi sang điểm rèn luyện)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Hệ thống:</span>
                    <div className="w-20 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded text-center font-bold text-primary">
                      {evaluationData.autoScores?.STUDY_RESULTS || 0}
                    </div>
                  </div>
                </div>

                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 size-10 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center">
                      <span className="material-symbols-outlined">edit_note</span>
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-slate-100 font-semibold">Ý thức tham gia CLB học thuật</p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Tham gia đầy đủ các buổi sinh hoạt chuyên đề (Max: 5đ)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Sinh viên:</span>
                    <input 
                      disabled={!isEditable}
                      value={studentPoints.ACADEMIC_CLUB}
                      onChange={(e) => handlePointChange('ACADEMIC_CLUB', e.target.value, 5)}
                      className="w-20 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 rounded text-center font-bold focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all disabled:opacity-50" 
                      type="number" 
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section II */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold">II. Ý thức chấp hành nội quy (Tối đa 25đ)</h2>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 size-10 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                      <span className="material-symbols-outlined">gavel</span>
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-slate-100 font-semibold">Chấp hành quy chế thi & học tập</p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Không vi phạm quy chế trong học kỳ</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Hệ thống:</span>
                    <div className="w-20 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded text-center font-bold text-primary">
                      {evaluationData.autoScores?.RULE_COMPLIANCE || 0}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section III */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold">III. Hoạt động chính trị, xã hội (Tối đa 20đ)</h2>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 size-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
                      <span className="material-symbols-outlined">groups</span>
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-slate-100 font-semibold">Tham gia sự kiện Đoàn/Hội</p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Hệ thống ghi nhận điểm hoạt động</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Hệ thống:</span>
                    <div className="w-20 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded text-center font-bold text-primary">
                      {evaluationData.autoScores?.SOCIAL_ACTIVITIES || 0}
                    </div>
                  </div>
                </div>

                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 size-10 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center">
                      <span className="material-symbols-outlined">volunteer_activism</span>
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-slate-100 font-semibold">Hoạt động tình nguyện bên ngoài</p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Cần đính kèm minh chứng giấy xác nhận (Max: 15đ)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Sinh viên:</span>
                    <input 
                      disabled={!isEditable}
                      value={studentPoints.VOLUNTEER}
                      onChange={(e) => handlePointChange('VOLUNTEER', e.target.value, 15)}
                      className="w-20 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 rounded text-center font-bold focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all disabled:opacity-50" 
                      type="number" 
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {isEditable && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg mt-4">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">info</span>
                </div>
                <div className="text-sm">
                  <p className="text-slate-900 dark:text-slate-100 font-bold">Xác nhận thông tin</p>
                  <p className="text-slate-500 dark:text-slate-400">Vui lòng kiểm tra kỹ trước khi gửi phiếu.</p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => handleSubmit(true)}
                  disabled={submitting}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Lưu nháp
                </button>
                <button 
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="flex-1 sm:flex-none px-8 py-3 rounded-lg bg-primary text-white font-bold text-sm shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>Gửi phiếu</span>
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </div>
            </div>
          )}

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 flex gap-3 mb-10">
            <span className="material-symbols-outlined text-primary">lightbulb</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
              * Ghi chú: Điểm hệ thống được cập nhật tự động từ cơ sở dữ liệu học tập và quản lý sinh viên. Đối với các mục tự đánh giá có điểm, sinh viên cần cung cấp minh chứng khi được yêu cầu để Hội đồng đánh giá phê duyệt.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
