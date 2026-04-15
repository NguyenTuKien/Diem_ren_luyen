import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useCurrentSemester } from '../../../hooks/useCurrentSemester';
import { useLecturerEvaluationList } from '../hooks/useLecturerEvaluationList';
import { finalizeLecturerEvaluations } from '../../../api/evaluationApi';
import {
  exportLecturerClassStatistics,
  getLecturerClassStatistics,
} from '../../../api/notificationStatisticsApi';
import { apiRequest } from '../../../shared/api/http';
import LecturerReviewModal from './LecturerReviewModal';
import '../../../styles/MonitorClass.css';

const STATUS_DISPLAY = {
  SUBMITTED: { label: 'SUBMITTED', badge: 'badge-submitted' },
  MONITOR_APPROVED: { label: 'MONITOR_APPROVED', badge: 'badge-monitor_approved' },
  FINALIZED: { label: 'FINALIZED', badge: 'badge-finalized' },
  DRAFT: { label: 'DRAFT', badge: 'badge-draft' },
  OPEN: { label: 'NOT_SUBMITTED', badge: 'badge-not_submitted' },
};

function getInitials(name) {
  if (!name) return 'NA';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[parts.length - 2][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default function LecturerClassEvaluation() {
  const { user } = useAuth();

  // --- Semester state ---
  const { semesters, activeSemesterId, loading: semesterLoading, error: semesterError } = useCurrentSemester();
  const [selectedSemester, setSelectedSemester] = useState(null);

  // --- Class list state (fetch all classes, backend filters by lecturer auth) ---
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);

  useEffect(() => {
    if (activeSemesterId && !selectedSemester) {
      setSelectedSemester(activeSemesterId);
    }
  }, [activeSemesterId, selectedSemester]);

  // Fetch danh sách lớp của giảng viên qua /lecturer/students/options
  useEffect(() => {
    const lecturerId = user?.backendUserId || user?.userId || user?.profileCode;
    if (!lecturerId) {
      setClassesError('Không xác định được mã giảng viên. Vui lòng đăng nhập lại.');
      setClassesLoading(false);
      return;
    }

    async function fetchClasses() {
      setClassesLoading(true);
      setClassesError(null);
      try {
        const res = await apiRequest(`/lecturer/students/options?lecturerId=${lecturerId}`);
        // Response: { classes: [{id, classCode, ...}], faculties: [...] }
        const raw = res?.data || res;
        const data = Array.isArray(raw?.classes) ? raw.classes : [];
        setClasses(data);
        if (data.length > 0 && !selectedClassId) {
          setSelectedClassId(data[0].id);
        }
      } catch (err) {
        setClassesError(err.message || 'Không tải được danh sách lớp');
      } finally {
        setClassesLoading(false);
      }
    }
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.backendUserId, user?.userId, user?.profileCode]);

  // --- Student evaluation list ---
  const {
    students,
    stats,
    isLoading: listLoading,
    error: listError,
    fetchClassList,
  } = useLecturerEvaluationList(selectedClassId, selectedSemester);

  useEffect(() => {
    if (selectedClassId && selectedSemester) {
      fetchClassList();
    }
  }, [selectedClassId, selectedSemester, fetchClassList]);

  const [activeModalStudent, setActiveModalStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [finalizing, setFinalizing] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [statisticsError, setStatisticsError] = useState(null);
  const itemsPerPage = 10;

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return students.slice(start, start + itemsPerPage);
  }, [students, currentPage]);

  const totalPages = Math.ceil(students.length / itemsPerPage);

  const selectedClassObj = classes.find(c => c.id === selectedClassId);

  useEffect(() => {
    let ignore = false;

    async function fetchStatistics() {
      if (!selectedClassId || !selectedSemester) {
        return;
      }

      setStatisticsLoading(true);
      setStatisticsError(null);
      try {
        const response = await getLecturerClassStatistics({
          classId: selectedClassId,
          semesterId: selectedSemester,
        });
        if (!ignore) {
          setStatistics(response);
        }
      } catch (err) {
        if (!ignore) {
          setStatisticsError(err.message || 'Không tải được thống kê lớp.');
        }
      } finally {
        if (!ignore) {
          setStatisticsLoading(false);
        }
      }
    }

    fetchStatistics();
    return () => {
      ignore = true;
    };
  }, [selectedClassId, selectedSemester]);

  const handleFinalizeAll = async () => {
    if (!window.confirm('Xác nhận hoàn tất (Finalize) toàn bộ phiếu đã được lớp trưởng duyệt trong kỳ này?')) return;
    setFinalizing(true);
    try {
      await finalizeLecturerEvaluations({ classId: selectedClassId, semesterId: selectedSemester });
      fetchClassList();
    } catch (err) {
      alert(err.message || 'Lỗi khi hoàn tất. Vui lòng thử lại.');
    } finally {
      setFinalizing(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const { blob, fileName } = await exportLecturerClassStatistics({
        classId: selectedClassId,
        semesterId: selectedSemester,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `Danh_Sach_Ren_Luyen_${selectedClassObj?.classCode || 'Lop'}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Không thể xuất báo cáo Excel từ backend.');
    }
  };

  const totalStudents = statistics?.totalStudents ?? stats.total;
  const participatedStudents = statistics?.participatedStudents ?? stats.approvedByMonitor;
  const participationRate = statistics?.participationRate ?? (totalStudents > 0 ? (participatedStudents / totalStudents) * 100 : 0);
  const notParticipated = Math.max(totalStudents - participatedStudents, 0);

  const scoreDistribution = useMemo(() => {
    const raw = Array.isArray(statistics?.scoreDistribution) ? statistics.scoreDistribution : [];
    const normalized = [
      { key: 'excellent', label: 'Xuất sắc', color: '#16a34a' },
      { key: 'good', label: 'Tốt', color: '#2563eb' },
      { key: 'fair', label: 'Khá', color: '#f59e0b' },
      { key: 'average', label: 'Trung bình', color: '#ef4444' },
    ].map((preset) => {
      const matched = raw.find((item) => String(item?.key || '').toLowerCase() === preset.key);
      return {
        ...preset,
        count: matched?.count ?? 0,
        percentage: matched?.percentage ?? 0,
      };
    });

    return normalized;
  }, [statistics?.scoreDistribution]);

  const maxDistributionCount = useMemo(() => {
    const max = Math.max(...scoreDistribution.map((item) => item.count), 0);
    return max > 0 ? max : 1;
  }, [scoreDistribution]);

  // Loading/Error states
  if (semesterLoading || classesLoading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu...</div>;
  }
  if (semesterError || classesError) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#d32f2f' }}>Lỗi: {semesterError || classesError}</div>;
  }
  if (semesters.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#d32f2f' }}>Hệ thống chưa cấu hình học kỳ.</div>;
  }
  if (classes.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#d32f2f' }}>Bạn chưa được phân công lớp nào.</div>;
  }

  return (
    <div className="monitor-eval-container">
      {/* Header */}
      <div className="monitor-eval-header">
        <div className="monitor-eval-title">
          <h1>Quản lý điểm rèn luyện{selectedClassObj ? ` - Lớp ${selectedClassObj.classCode}` : ''}</h1>
          <p>Xem xét và xác nhận tổng kết điểm rèn luyện cho sinh viên trong lớp.</p>
        </div>
        <div className="monitor-eval-controls">
          {/* Class selector */}
          <div className="monitor-semester-select">
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748b' }}>class</span>
            <select
              value={selectedClassId || ''}
              onChange={e => {
                setSelectedClassId(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.classCode}</option>
              ))}
            </select>
          </div>
          {/* Semester selector */}
          <div className="monitor-semester-select">
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748b' }}>calendar_today</span>
            <select
              value={selectedSemester || ''}
              onChange={e => {
                setSelectedSemester(e.target.value);
                setCurrentPage(1);
              }}
            >
              {semesters.map(sem => (
                <option key={sem.id} value={sem.id}>{sem.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="monitor-stats-cards">
        <div className="monitor-stat-card">
          <div className="stat-icon blue">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div className="stat-info">
            <span className="stat-label">TỔNG SỐ SINH VIÊN</span>
            <span className="stat-value">{String(totalStudents).padStart(2, '0')}</span>
            <span className="stat-subtext blue">{selectedClassObj ? `Lớp ${selectedClassObj.classCode}` : 'Trong lớp'}</span>
          </div>
        </div>

        <div className="monitor-stat-card">
          <div className="stat-icon green">
            <span className="material-symbols-outlined">verified</span>
          </div>
          <div className="stat-info">
            <span className="stat-label">SV THAM GIA HOẠT ĐỘNG</span>
            <span className="stat-value">{String(participatedStudents).padStart(2, '0')}</span>
            <span className="stat-subtext green">Tỷ lệ: {Math.round(participationRate * 10) / 10}%</span>
          </div>
        </div>

        <div className="monitor-stat-card">
          <div className="stat-icon orange">
            <span className="material-symbols-outlined">pending</span>
          </div>
          <div className="stat-info">
            <span className="stat-label">CHƯA THAM GIA</span>
            <span className="stat-value">{String(notParticipated).padStart(2, '0')}</span>
            <span className="stat-subtext orange">Theo API thống kê lớp</span>
          </div>
        </div>
      </div>

      {statisticsError && (
        <div style={{ marginBottom: '16px', color: '#dc2626', fontSize: '13px' }}>{statisticsError}</div>
      )}
      {statisticsLoading && (
        <div style={{ marginBottom: '16px', color: '#64748b', fontSize: '13px' }}>Đang tải thống kê lớp...</div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 700 }}>
            Phân phổ điểm rèn luyện
          </h3>
          <p style={{ margin: '6px 0 14px', fontSize: '12px', color: '#64748b' }}>
            Thống kê theo 4 nhóm: Xuất sắc, Tốt, Khá, Trung bình.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {scoreDistribution.map((item) => (
              <div key={item.key}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                    fontSize: '12px',
                  }}
                >
                  <span style={{ color: '#334155', fontWeight: 600 }}>{item.label}</span>
                  <span style={{ color: '#64748b' }}>
                    {item.count} SV ({Math.round(item.percentage * 10) / 10}%)
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '10px',
                    borderRadius: '999px',
                    background: '#e2e8f0',
                    overflow: 'hidden',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      height: '100%',
                      width: `${(item.count / maxDistributionCount) * 100}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 700 }}>
              Tỷ lệ tham gia sự kiện
            </h3>
            <p style={{ margin: '6px 0 14px', fontSize: '12px', color: '#64748b' }}>
              Dựa trên số sinh viên có tham gia hoạt động trong học kỳ.
            </p>
          </div>

          <div>
            <div
              style={{
                width: '100%',
                height: '12px',
                borderRadius: '999px',
                background: '#e2e8f0',
                overflow: 'hidden',
                marginBottom: '10px',
              }}
            >
              <span
                style={{
                  display: 'block',
                  width: `${Math.max(0, Math.min(participationRate, 100))}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ padding: '10px', borderRadius: '10px', background: '#f0fdf4' }}>
                <div style={{ fontSize: '11px', color: '#166534', marginBottom: '4px' }}>Đã tham gia</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#166534' }}>{participatedStudents}</div>
              </div>
              <div style={{ padding: '10px', borderRadius: '10px', background: '#fff7ed' }}>
                <div style={{ fontSize: '11px', color: '#9a3412', marginBottom: '4px' }}>Chưa tham gia</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#9a3412' }}>{notParticipated}</div>
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '12px', color: '#334155' }}>
              <strong>{Math.round(participationRate * 10) / 10}%</strong> ({participatedStudents}/{totalStudents} sinh viên)
            </div>
          </div>
        </section>
      </div>

      {/* Table */}
      <div className="monitor-table-card">
        {/* Header - chỉ có tiêu đề */}
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Danh sách đánh giá điểm rèn luyện
          </h2>
        </div>

        {/* Action bar - hai nút riêng biệt, layout thoáng */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid #f1f5f9',
        }}>
          <button
            className="action-export"
            onClick={handleExportExcel}
            style={{ flex: 'none' }}
          >
            <span className="material-symbols-outlined">download</span>
            Xuất báo cáo (Excel)
          </button>
          <button
            className="action-approve-all"
            disabled={finalizing || stats.total === 0 || stats.approvedByMonitor < stats.total}
            onClick={handleFinalizeAll}
            style={{ backgroundColor: '#3b82f6', flex: 'none' }}
            title={stats.approvedByMonitor < stats.total ? `Còn ${stats.pendingCount} phiếu chưa được lớp trưởng duyệt` : ''}
          >
            {finalizing ? 'Đang hoàn tất...' : 'Hoàn tất tổng kết'}
          </button>
          {stats.approvedByMonitor < stats.total && stats.total > 0 && (
            <span style={{ fontSize: '13px', color: '#94a3b8', alignSelf: 'center' }}>
              ({stats.approvedByMonitor}/{stats.total} phiếu đã duyệt)
            </span>
          )}
        </div>

        {listLoading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>Đang tải danh sách...</div>
        ) : listError ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#d32f2f' }}>{listError}</div>
        ) : (
          <table className="monitor-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã sinh viên</th>
                <th>Họ và tên</th>
                <th style={{ textAlign: 'center' }}>Điểm tổng kết</th>
                <th style={{ textAlign: 'center' }}>Trạng thái</th>
                <th style={{ textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    Không có dữ liệu đánh giá cho lớp và học kỳ này.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student, index) => {
                  const sKey = (!student.status || student.status === 'OPEN') ? 'OPEN' : student.status;
                  const statusMeta = STATUS_DISPLAY[sKey] || STATUS_DISPLAY['OPEN'];
                  const canApprove = student.status === 'MONITOR_APPROVED';

                  return (
                    <tr key={student.studentId || student.studentCode}>
                      <td className="cell-stt">
                        {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}
                      </td>
                      <td className="cell-code">{student.studentCode}</td>
                      <td>
                        <div className="cell-student">
                          <div className="student-avatar">{getInitials(student.fullName)}</div>
                          <span className="student-name">{student.fullName}</span>
                        </div>
                      </td>
                      <td className="cell-score final" style={{ textAlign: 'center' }}>
                        {student.finalScore || '--'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`status-badge ${statusMeta.badge}`}>{statusMeta.label}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className={canApprove ? 'btn-detail' : 'btn-detail-view'}
                          style={canApprove ? { borderColor: '#93c5fd', color: '#3b82f6' } : {}}
                          onClick={() => {
                            if (!student.evaluationId) {
                              alert('Sinh viên này chưa tạo phiếu đánh giá.');
                              return;
                            }
                            setActiveModalStudent(student);
                          }}
                        >
                          {canApprove ? 'Xem / Tổng kết' : 'Xem chi tiết'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {students.length > 0 && (
          <div className="table-footer">
            <div className="table-info">
              Hiển thị {paginatedStudents.length} trong số {students.length} sinh viên
            </div>
            <div className="table-pagination">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="page-btn"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {activeModalStudent && (
        <LecturerReviewModal
          evaluationId={activeModalStudent.evaluationId}
          studentName={activeModalStudent.fullName}
          studentCode={activeModalStudent.studentCode}
          status={activeModalStudent.status}
          onClose={() => setActiveModalStudent(null)}
          onSuccess={() => {
            setActiveModalStudent(null);
            fetchClassList();
          }}
        />
      )}
    </div>
  );
}
