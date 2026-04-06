import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { evaluationService } from '../../services/evaluationService';

export default function EvaluationReviewForm({ isLecturer = false }) {
  const { id } = useParams();
  const evaluationId = id;
  const navigate = useNavigate();

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

  const [adjustedDetails, setAdjustedDetails] = useState({
    ACADEMIC_CLUB: 0,
    VOLUNTEER: 0
  });

  const [feedback, setFeedback] = useState('');

  const loadReviewForm = useCallback(async () => {
    try {
      setLoading(true);
      const res = isLecturer 
        ? await evaluationService.getDetailLecturer(evaluationId)
        : await evaluationService.getDetailMonitor(evaluationId);

      if (res && res.data) {
        setEvaluationData(res.data);
        if (res.data.details) {
          setAdjustedDetails({
            ACADEMIC_CLUB: res.data.details.ACADEMIC_CLUB || 0,
            VOLUNTEER: res.data.details.VOLUNTEER || 0
          });
        }
      }
    } catch (error) {
      showToast(error.message || 'Lỗi khi tải chi tiết đánh giá', 'error');
    } finally {
      setLoading(false);
    }
  }, [evaluationId, isLecturer]);

  useEffect(() => {
    if (evaluationId) {
      loadReviewForm();
    }
  }, [evaluationId, loadReviewForm]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdjustChange = (key, value, max) => {
    let val = parseInt(value) || 0;
    if (val < 0) val = 0;
    if (val > max) val = max;
    setAdjustedDetails((prev) => ({ ...prev, [key]: val }));
  };

  const handleReviewSubmit = async () => {
    try {
      setSubmitting(true);
      const payload = {
        evaluationId,
        adjustedDetails,
        feedback // Not in API spec but commonly sent if feedback exists
      };

      if (isLecturer) {
        await evaluationService.reviewEvaluationLecturer(payload);
      } else {
        await evaluationService.reviewEvaluationMonitor(payload);
      }
      
      showToast('Đã duyệt và lưu điểm thành công!');
      setTimeout(() => navigate(-1), 1500); // go back to list
    } catch (error) {
      showToast(error.message || 'Lỗi khi duyệt phiếu', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Đang tải phiếu...</div>;

  const totalSystem = Object.values(evaluationData.autoScores || {}).reduce((a, b) => a + (b || 0), 0);
  const totalStudent = Object.values(evaluationData.details || {}).reduce((a, b) => a + (b || 0), 0) + totalSystem;
  const totalReviewer = Object.values(adjustedDetails).reduce((a, b) => a + (b || 0), 0) + totalSystem;

  return (
    <div className="bg-background text-on-background antialiased overflow-x-hidden min-h-screen pt-20 pb-32 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-lg shadow-lg text-white font-bold transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.message}
        </div>
      )}

      {/* Header Status Card */}
      <section className="mb-8">
        <div className="bg-surface rounded-2xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
              <span className="material-symbols-outlined text-3xl">person_search</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Chi tiết đánh giá {evaluationId}</h3>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-2"></span>
                  Trạng thái: {evaluationData.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="text-center px-6 py-3 bg-surface-container rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Điểm SV tự chấm</p>
              <p className="text-2xl font-black text-slate-900">{totalStudent}<span className="text-sm font-normal text-slate-400 ml-1">/100</span></p>
            </div>
            <div className="text-center px-6 py-3 bg-primary-container rounded-2xl border border-red-100">
              <p className="text-[10px] font-bold text-red-700 uppercase tracking-widest mb-1">Điểm {isLecturer ? 'GV' : 'LT'} dự kiến</p>
              <p className="text-2xl font-black text-primary">{totalReviewer}<span className="text-sm font-normal text-red-400 ml-1">/100</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Criterion Sections */}
      <div className="space-y-6">
        {/* Section I */}
        <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-surface-container-low px-8 py-4 flex justify-between items-center border-b border-slate-100">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-sm">I</span>
              Đánh giá về ý thức học tập (Tối đa 20đ)
            </h4>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-8 py-3 w-1/2">Nội dung đánh giá</th>
                  <th className="px-4 py-3 text-center">Hệ thống</th>
                  <th className="px-4 py-3 text-center">SV Tự chấm</th>
                  <th className="px-8 py-3 text-center">{isLecturer ? 'GV Đánh giá' : 'LT Đánh giá'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4 text-sm text-slate-700">1. Kết quả học tập (Quy đổi)</td>
                  <td className="px-4 py-4 text-center font-bold text-slate-500">{evaluationData.autoScores?.STUDY_RESULTS || 0}</td>
                  <td className="px-4 py-4 text-center">
                    <div className="w-12 h-8 bg-[#f3f4f6] rounded-lg flex items-center justify-center text-sm font-bold text-slate-600 mx-auto">
                      {evaluationData.autoScores?.STUDY_RESULTS || 0}
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="w-20 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-bold text-slate-400 mx-auto">Auto</div>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4 text-sm text-slate-700">2. Ý thức tham gia CLB học thuật (Max 5đ)</td>
                  <td className="px-4 py-4 text-center font-bold text-slate-500">0</td>
                  <td className="px-4 py-4 text-center">
                    <div className="w-12 h-8 bg-[#f3f4f6] rounded-lg flex items-center justify-center text-sm font-bold text-slate-600 mx-auto">
                      {evaluationData.details?.ACADEMIC_CLUB || 0}
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <input 
                      value={adjustedDetails.ACADEMIC_CLUB}
                      onChange={e => handleAdjustChange('ACADEMIC_CLUB', e.target.value, 5)}
                      className="w-20 mx-auto block text-center bg-white border-2 border-primary/20 focus:border-primary focus:ring-0 rounded-lg h-9 font-bold text-primary" 
                      type="number" 
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section II */}
        <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-surface-container-low px-8 py-4 flex justify-between items-center border-b border-slate-100">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-sm">II</span>
              Ý thức chấp hành nội quy (Tối đa 25đ)
            </h4>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4 text-sm text-slate-700 w-1/2">1. Chấp hành các văn bản chỉ đạo của nhà trường</td>
                  <td className="px-4 py-4 text-center font-bold text-slate-500 w-1/12">{evaluationData.autoScores?.RULE_COMPLIANCE || 0}</td>
                  <td className="px-4 py-4 text-center w-1/6">
                    <div className="w-12 h-8 bg-[#f3f4f6] rounded-lg flex items-center justify-center text-sm font-bold text-slate-600 mx-auto">
                      {evaluationData.autoScores?.RULE_COMPLIANCE || 0}
                    </div>
                  </td>
                  <td className="px-8 py-4 w-1/4">
                     <div className="w-20 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-bold text-slate-400 mx-auto">Auto</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section III */}
        <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-surface-container-low px-8 py-4 flex justify-between items-center border-b border-slate-100">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-sm">III</span>
              Hoạt động chính trị, xã hội (Tối đa 20đ)
            </h4>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4 text-sm text-slate-700 w-1/2">1. Tham gia sự kiện Đoàn/Hội</td>
                  <td className="px-4 py-4 text-center font-bold text-slate-500 w-1/12">{evaluationData.autoScores?.SOCIAL_ACTIVITIES || 0}</td>
                  <td className="px-4 py-4 text-center w-1/6">
                    <div className="w-12 h-8 bg-[#f3f4f6] rounded-lg flex items-center justify-center text-sm font-bold text-slate-600 mx-auto">
                      {evaluationData.autoScores?.SOCIAL_ACTIVITIES || 0}
                    </div>
                  </td>
                  <td className="px-8 py-4 w-1/4">
                     <div className="w-20 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-bold text-slate-400 mx-auto">Auto</div>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4 text-sm text-slate-700">2. Hoạt động tình nguyện bên ngoài (Max 15đ)</td>
                  <td className="px-4 py-4 text-center font-bold text-slate-500">0</td>
                  <td className="px-4 py-4 text-center">
                    <div className="w-12 h-8 bg-[#f3f4f6] rounded-lg flex items-center justify-center text-sm font-bold text-slate-600 mx-auto">
                      {evaluationData.details?.VOLUNTEER || 0}
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <input 
                      value={adjustedDetails.VOLUNTEER}
                      onChange={e => handleAdjustChange('VOLUNTEER', e.target.value, 15)}
                      className="w-20 mx-auto block text-center bg-white border-2 border-primary/20 focus:border-primary focus:ring-0 rounded-lg h-9 font-bold text-primary" 
                      type="number" 
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <section className="mt-8 mb-12">
        <h4 className="text-lg font-bold text-slate-900 mb-4 px-2">Phản hồi của {isLecturer ? 'Giảng viên' : 'Lớp trưởng'}</h4>
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-slate-100">
          <textarea 
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl p-4 text-sm text-slate-700 outline-none" 
            placeholder="Nhập nhận xét hoặc lý do nếu yêu cầu sinh viên làm lại..." 
            rows="3"
          ></textarea>
        </div>
      </section>

      {/* Confirmation Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 py-6 px-8 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tổng điểm {isLecturer ? 'GV' : 'LT'} chấm</p>
              <p className="text-2xl font-black text-slate-900">{totalReviewer}<span className="text-sm font-normal text-slate-400 ml-1">/100</span></p>
            </div>
            <div className="h-10 w-[1px] bg-slate-200"></div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Xếp loại dự kiến</p>
              <span className="text-sm font-bold text-emerald-600">
                {totalReviewer >= 90 ? 'Xuất sắc' : totalReviewer >= 80 ? 'Tốt' : totalReviewer >= 65 ? 'Khá' : totalReviewer >= 50 ? 'Trung bình' : 'Yếu'}
              </span>
            </div>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-8 py-3 rounded-xl border-2 border-red-600 text-red-600 font-bold text-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-lg">assignment_return</span>
              Yêu cầu làm lại
            </button>
            <button 
              onClick={handleReviewSubmit}
              disabled={submitting}
              className="flex-1 sm:flex-none px-10 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-red-200 hover:bg-red-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">verified</span>
              Duyệt & Lưu điểm
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
