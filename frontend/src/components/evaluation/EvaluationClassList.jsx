import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { evaluationService } from '../../services/evaluationService';

export default function EvaluationClassList({ isLecturer = false, semesterId = 1, classId }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  
  // Basic pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadClassList();
  }, [isLecturer, semesterId, classId]);

  const loadClassList = async () => {
    try {
      setLoading(true);
      const res = isLecturer 
        ? await evaluationService.getClassListLecturer(classId, semesterId)
        : await evaluationService.getClassListMonitor(semesterId);
        
      if (res && res.data) {
        setStudents(res.data);
      }
    } catch (err) {
      setError(err.message || 'Lỗi tải danh sách lớp');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'FINALIZED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">FINALIZED</span>;
      case 'MONITOR_APPROVED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700">MONITOR_APPROVED</span>;
      case 'SUBMITTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">SUBMITTED</span>;
      case 'NOT_SUBMITTED':
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600">NOT_SUBMITTED</span>;
    }
  };

  const currentStudents = students.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(students.length / itemsPerPage) || 1;

  const handleReviewClick = (evaluationId) => {
    if (evaluationId) {
      navigate(`/evaluation/review/${evaluationId}`);
    } else {
      alert('Sinh viên này chưa có phiếu đánh giá');
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Đang tải danh sách...</div>;

  const totalSubmitted = students.filter(s => s.status !== 'NOT_SUBMITTED').length;
  const totalNotSubmitted = students.length - totalSubmitted;
  
  return (
    <div className="bg-background text-on-background antialiased min-h-screen pt-10 pb-12 px-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Class Management</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary">Assessments</span>
          </nav>
          <h1 className="text-[30px] font-bold tracking-tight text-slate-900">
            Quản lý điểm rèn luyện - {isLecturer ? 'Danh sách Lớp' : 'Lớp của bạn'}
          </h1>
          <p className="text-slate-600">Theo dõi và phê duyệt kết quả rèn luyện học kỳ hiện tại của sinh viên.</p>
        </div>
      </header>

      {error && <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-xl">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-50 flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined text-3xl">person</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tổng số sinh viên</p>
            <h3 className="text-2xl font-bold text-slate-900">{students.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-50 flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-3xl">check_circle</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Số phiếu đã nộp/Duyệt</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalSubmitted}</h3>
            <div className="w-full bg-slate-100 h-1 rounded-full mt-2">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${students.length ? (totalSubmitted / students.length) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-50 flex items-center gap-5">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
            <span className="material-symbols-outlined text-3xl">pending</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Số phiếu chưa nộp</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalNotSubmitted}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-50">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">Danh sách đánh giá điểm rèn luyện</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">STT</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Mã Sinh Viên</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Họ và Tên</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Điểm tổng kết</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentStudents.map((sv, idx) => (
                <tr key={sv.studentId || idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{sv.studentCode}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                        {sv.fullName ? sv.fullName.charAt(0) : 'U'}
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{sv.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-center font-bold text-primary">{sv.finalScore != null ? sv.finalScore : '--'}</td>
                  <td className="px-6 py-4">
                    {getStatusBadge(sv.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleReviewClick(sv.evaluationId)}
                      className="px-3 py-1.5 border border-primary text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all"
                    >
                      Xem chi tiết / Duyệt
                    </button>
                  </td>
                </tr>
              ))}
              {currentStudents.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Không có dữ liệu sinh viên.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Hiển thị {currentStudents.length} trong số {students.length} sinh viên</span>
          <div className="flex items-center gap-1">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="px-4 text-sm font-bold">{currentPage} / {totalPages}</span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
