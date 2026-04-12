import React, { useEffect, useMemo, useState } from 'react';
import { useStudentEvaluationForm } from './hooks/useStudentEvaluationForm';
import { useCurrentSemester } from '../../hooks/useCurrentSemester';
import './StudentEvaluationBoard.css';

export default function StudentEvaluationBoard() {
  const { semesters, activeSemesterId, loading: semesterLoading, error: semesterError } = useCurrentSemester();
  const [selectedSemester, setSelectedSemester] = useState(null);

  // Initialize selectedSemester once activeSemesterId is loaded
  useEffect(() => {
    if (activeSemesterId && !selectedSemester) {
      setSelectedSemester(activeSemesterId);
    }
  }, [activeSemesterId, selectedSemester]);

  const {
    formData,
    criteriaList,
    selfScores,
    isLoading,
    isSubmitting,
    error,
    fetchForm,
    handleScoreChange,
    handleSubmit
  } = useStudentEvaluationForm(selectedSemester);

  useEffect(() => {
    if (selectedSemester) {
      fetchForm();
    }
  }, [selectedSemester, fetchForm]);

  const autoScores = formData?.autoScores || {};

  // Xử lý mapping CriteriaEntity từ DB -> UI Model
  const dynamicCriteriaStructure = useMemo(() => {
    if (!criteriaList || criteriaList.length === 0) return [];

    const items = criteriaList.map(c => {
      const systemPoint = autoScores[c.code];
      const hasAuto = systemPoint !== undefined;

      // Phân quyền theo yêu cầu: Tiêu chí không yêu cầu minh chứng là tự chấm, còn lại là hệ thống
      const isStudentEvaluated = !c.requireEvidence;

      let descText = `Tối đa: ${c.maxPoint || 0}đ`;

      if (isStudentEvaluated) {
        // Tiêu chí tự chấm chỉ cần hiện tổng điểm (Tối đa: Xđ)
      } else {
        // Tiêu chí hệ thống tính thì hiện chi tiết mỗi lần tham gia và điểm hệ thống
        if (c.pointPerItem && c.pointPerItem > 0) {
          descText += ` - Mỗi lần ghi nhận: ${c.pointPerItem}đ`;
        }
        if (hasAuto && systemPoint > 0) {
          descText += ` (Hệ thống đã cộng: +${systemPoint}đ)`;
        }
      }

      return {
        code: c.code,
        name: c.name,
        desc: descText,
        type: isStudentEvaluated ? 'student' : 'system',
        maxPoint: c.maxPoint,
        point: hasAuto ? systemPoint : 0,
        takesEvidence: c.requireEvidence,
        icon: isStudentEvaluated ? "list_alt" : "star_rate",
        iconBg: isStudentEvaluated ? "color-orange-bg" : "color-blue-bg",
        iconColor: isStudentEvaluated ? "color-orange-text" : "color-blue-text"
      };
    });

    const totalGroupMax = items.reduce((acc, i) => acc + (i.maxPoint || 0), 0);
    const totalGroupAuto = items.filter(i => i.type === 'system').reduce((acc, i) => acc + (i.point || 0), 0);

    return [
      {
        group: `Danh sách tiêu chí đánh giá (Tối đa ${totalGroupMax}đ)`,
        maxPoint: totalGroupMax,
        autoLabel: `Tự động: ${totalGroupAuto}đ`,
        items: items
      }
    ];
  }, [criteriaList, autoScores]);

  // Compute totals
  const totalSystemScore = useMemo(() => {
    return Object.values(autoScores).reduce((acc, val) => acc + (Number(val) || 0), 0);
  }, [autoScores]);

  const totalSelfScore = useMemo(() => {
    return Object.values(selfScores).reduce((acc, val) => acc + (Number(val) || 0), 0);
  }, [selfScores]);

  if (semesterLoading || isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải biểu mẫu phân tích rèn luyện...</div>;
  }

  if (error || semesterError) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#d32f2f' }}>Lỗi tải dữ liệu: {error || semesterError}</div>;
  }

  if (!formData) {
    if (!semesterLoading && semesters.length === 0) {
      return <div style={{ padding: '40px', textAlign: 'center', color: '#d32f2f' }}>Hệ thống chưa thiết lập cấu hình Học kỳ. Vui lòng liên hệ Admin.</div>;
    }
    return <div style={{ padding: '40px', textAlign: 'center' }}>Hệ thống đang chuẩn bị dữ liệu...</div>;
  }

  const status = formData.status || 'OPEN';

  const selectedSemesterObj = semesters.find(s => s.id === Number(selectedSemester));
  let isOutsideEvaluationPeriod = false;
  if (selectedSemesterObj && selectedSemesterObj.endDate) {
    const today = new Date();
    const endDate = new Date(selectedSemesterObj.endDate);
    const oneMonthBefore = new Date(selectedSemesterObj.endDate);
    oneMonthBefore.setMonth(oneMonthBefore.getMonth() - 1);

    if (today < oneMonthBefore || today > endDate) {
      isOutsideEvaluationPeriod = true;
    }
  }

  const isReadOnly = (status !== 'OPEN' && status !== 'DRAFT') || isOutsideEvaluationPeriod;

  const statusDisplay = {
    'OPEN': 'Chưa nộp',
    'DRAFT': 'Bản nháp',
    'SUBMITTED': 'Đã nộp',
    'MONITOR_APPROVED': 'Lớp trưởng đã duyệt',
    'FINALIZED': 'Đã có kết quả'
  };

  const formattedDeadline = selectedSemesterObj?.endDate 
    ? new Date(selectedSemesterObj.endDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'Chưa xác định';

  return (
    <div className="eval-board-container">
      {isOutsideEvaluationPeriod && (
        <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '12px 20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #ffeeba', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
          <span className="material-symbols-outlined">warning</span>
          Hiện đang ngoài thời gian đánh giá điểm rèn luyện của học kỳ này. Bạn chỉ có thể xem phiếu đánh giá rèn luyện.
        </div>
      )}

      <div className="eval-board-header">
        <h1 className="eval-board-title">Phiếu đánh giá rèn luyện</h1>
        <div className="eval-board-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-symbols-outlined">calendar_today</span>
            <select
              value={selectedSemester || ''}
              onChange={(e) => setSelectedSemester(e.target.value)}
              style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', color: '#64748b', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              {semesters.map(sem => (
                <option key={sem.id} value={sem.id}>{sem.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="eval-summary-cards">
        <div className="eval-summary-card">
          <div>
            <div className="eval-card-label">Điểm hệ thống</div>
            <div className="eval-card-value">{totalSystemScore} <span className="eval-card-max">/100</span></div>
          </div>
          <div className="eval-card-progress">
            <div className="eval-card-progress-bar" style={{ width: `${Math.min(totalSystemScore, 100)}%` }}></div>
          </div>
        </div>

        <div className="eval-summary-card">
          <div>
            <div className="eval-card-label">Điểm tự đánh giá</div>
            <div className="eval-card-value" style={{ color: '#1a1a1a' }}>{totalSelfScore} <span className="eval-card-max">/100</span></div>
          </div>
          <div className="eval-card-progress" style={{ backgroundColor: '#f1f5f9' }}>
            <div className="eval-card-progress-bar" style={{ width: `${Math.min(totalSelfScore, 100)}%`, backgroundColor: '#cbd5e1' }}></div>
          </div>
        </div>

        <div className="eval-summary-card status-card" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="eval-card-label">Trạng thái phiếu</div>
            <div className="status-card-deadline" style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>
              Hạn cuối: {formattedDeadline}
            </div>
          </div>
          <div className="eval-card-value text-white" style={{ marginTop: '16px' }}>{statusDisplay[status] || status}</div>
        </div>
      </div>

      {dynamicCriteriaStructure.map((group, idx) => (
        <div key={idx} className="eval-group">
          <div className="eval-group-header">
            <h3 className="eval-group-title">{group.group}</h3>
          </div>

          <div className="eval-group-items">
            {group.items.map(item => (
              <div key={item.code} className="eval-item-card">
                <div className="eval-item-info">
                  <div className={`eval-item-icon ${item.iconBg}`}>
                    <span className={`material-symbols-outlined ${item.iconColor}`}>{item.icon}</span>
                  </div>
                  <div className="eval-item-text">
                    <h4 className="eval-item-title">{item.name}</h4>
                    <p className="eval-item-desc">{item.desc}</p>
                  </div>
                </div>

                <div className="eval-item-action">
                  <div className="eval-input-group">
                    <span className="eval-input-label">{item.type === 'system' ? 'HỆ THỐNG:' : 'SINH VIÊN:'}</span>
                    {item.type === 'system' ? (
                      <div className="eval-input-box system-box">{item.point}</div>
                    ) : (
                      <input
                        type="number"
                        className="eval-input-box"
                        min="0"
                        max={item.maxPoint}
                        disabled={isReadOnly}
                        value={selfScores[item.code] !== undefined ? selfScores[item.code] : ''}
                        onChange={(e) => handleScoreChange(item.code, e.target.value, item.maxPoint)}
                        placeholder="0"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="eval-bottom-bar">
        <div className="eval-bottom-info">
          <div className="eval-info-icon">
            <span className="material-symbols-outlined text-sm">info</span>
          </div>
          <div className="eval-info-text">
            <h4 className="eval-info-title">Xác nhận thông tin</h4>
            <p className="eval-info-desc">Vui lòng kiểm tra kỹ trước khi gửi phiếu.</p>
          </div>
        </div>
        <div className="eval-bottom-actions">
          <button
            className="eval-btn eval-btn-outline"
            disabled={isReadOnly || isSubmitting}
            onClick={() => handleSubmit(true)}
          >
            Lưu nháp
          </button>
          <button
            className="eval-btn eval-btn-solid"
            disabled={isReadOnly || isSubmitting}
            onClick={() => handleSubmit(false)}
          >
            Gửi phiếu <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
