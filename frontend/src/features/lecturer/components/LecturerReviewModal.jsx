import { useState, useEffect, useMemo } from 'react';
import { getLecturerEvaluationDetail, submitLecturerEvaluationReview } from '../../../api/evaluationApi';
import { getAllCriteria } from '../../../api/evaluationApi';
import '../../../styles/MonitorClass.css';

// Giảng viên chỉ được duyệt phiếu ở trạng thái MONITOR_APPROVED
// Các trạng thái khác (kể cả FINALIZED) chỉ xem
export default function LecturerReviewModal({ evaluationId, studentName, studentCode, status, onClose, onSuccess }) {
  const isReadOnly = status !== 'MONITOR_APPROVED';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [criteriaList, setCriteriaList] = useState([]);
  const [adjustedScores, setAdjustedScores] = useState({});

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [detailData, criteriaData] = await Promise.all([
          getLecturerEvaluationDetail(evaluationId),
          getAllCriteria()
        ]);
        setDetail(detailData);
        const criteria = Array.isArray(criteriaData) ? criteriaData : (criteriaData?.data || []);
        setCriteriaList(criteria);
        setAdjustedScores(detailData?.details || {});
      } catch (err) {
        setError(err.message || 'Lỗi tải chi tiết phiếu');
      } finally {
        setLoading(false);
      }
    }
    if (evaluationId) loadData();
  }, [evaluationId]);

  const handleScoreChange = (code, value, maxScore) => {
    if (isReadOnly) return;
    if (value === '') {
      setAdjustedScores(prev => ({ ...prev, [code]: '' }));
      return;
    }
    let v = parseInt(value, 10);
    if (isNaN(v)) return;
    if (v < 0) v = 0;
    if (maxScore !== undefined && v > maxScore) v = maxScore;
    setAdjustedScores(prev => ({ ...prev, [code]: v }));
  };

  const handleSubmit = async () => {
    if (isReadOnly) return;
    setSubmitting(true);
    try {
      await submitLecturerEvaluationReview({ evaluationId, adjustedDetails: adjustedScores });
      onSuccess();
    } catch (err) {
      alert(err.message || 'Lỗi phê duyệt. Vui lòng thử lại.');
      setSubmitting(false);
    }
  };

  const autoScores = detail?.autoScores || {};

  const totalGroupMax = useMemo(
    () => criteriaList.reduce((acc, c) => acc + (c.maxPoint || 0), 0),
    [criteriaList]
  );

  const mappedItems = useMemo(() => {
    return criteriaList.map(c => {
      const isStudentEvaluated = !c.requireEvidence;
      let descText = `Tối đa: ${c.maxPoint || 0}đ`;
      if (!isStudentEvaluated && c.pointPerItem && c.pointPerItem > 0) {
        descText += ` - Mỗi lần ghi nhận: ${c.pointPerItem}đ`;
      }
      return {
        code: c.code,
        name: c.name,
        desc: descText,
        type: isStudentEvaluated ? 'student' : 'system',
        maxPoint: c.maxPoint,
        systemPoint: autoScores[c.code] ?? 0,
        icon: isStudentEvaluated ? 'list_alt' : 'star_rate',
        iconBg: isStudentEvaluated ? 'mrm-icon-orange' : 'mrm-icon-blue',
      };
    });
  }, [criteriaList, autoScores]);

  const statusLabel = {
    MONITOR_APPROVED: 'Lớp trưởng đã duyệt — Chờ giảng viên phê duyệt',
    FINALIZED: 'Đã hoàn tất',
    SUBMITTED: 'Sinh viên đã nộp — Chờ lớp trưởng duyệt',
    DRAFT: 'Bản nháp',
    OPEN: 'Chưa nộp',
  }[status] || status;

  return (
    <div className="mrm-overlay" onClick={onClose}>
      <div className="mrm-container" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="mrm-header">
          <div>
            <h2 className="mrm-title">
              {isReadOnly ? 'Xem phiếu: ' : 'Phê duyệt phiếu: '}
              {studentName}
            </h2>
            <p className="mrm-subtitle">MSSV: {studentCode} &mdash; {statusLabel}</p>
          </div>
          <button className="mrm-close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="mrm-body">
          {loading ? (
            <div className="mrm-state">
              <span className="material-symbols-outlined mrm-spin">sync</span>
              <p>Đang tải dữ liệu phiếu...</p>
            </div>
          ) : error ? (
            <div className="mrm-state mrm-error">
              <span className="material-symbols-outlined">error</span>
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="mrm-group-header">
                <span className="material-symbols-outlined" style={{ color: '#3b82f6' }}>assignment</span>
                <h3>Danh sách tiêu chí đánh giá (Tối đa {totalGroupMax}đ)</h3>
              </div>

              <div className="mrm-criteria-list">
                {mappedItems.map(item => (
                  <div key={item.code} className="mrm-item">
                    <div className="mrm-item-left">
                      <div className={`mrm-item-icon ${item.iconBg}`}>
                        <span className="material-symbols-outlined">{item.icon}</span>
                      </div>
                      <div className="mrm-item-text">
                        <span className="mrm-item-name">{item.name}</span>
                        <span className="mrm-item-desc">{item.desc}</span>
                      </div>
                    </div>

                    <div className="mrm-item-score">
                      {item.type === 'system' ? (
                        <>
                          <span className="mrm-score-label">HỆ THỐNG:</span>
                          <div className="mrm-score-box mrm-score-readonly">{item.systemPoint}</div>
                        </>
                      ) : (
                        <>
                          <span className="mrm-score-label">SINH VIÊN:</span>
                          <input
                            type="number"
                            className={`mrm-score-box ${isReadOnly ? 'mrm-score-readonly' : ''}`}
                            min="0"
                            max={item.maxPoint}
                            value={adjustedScores[item.code] !== undefined ? adjustedScores[item.code] : ''}
                            onChange={e => handleScoreChange(item.code, e.target.value, item.maxPoint)}
                            readOnly={isReadOnly}
                            placeholder="0"
                          />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mrm-footer">
          <div className="mrm-footer-info">
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: isReadOnly ? '#64748b' : '#3b82f6' }}>
              {isReadOnly ? 'visibility' : 'info'}
            </span>
            <span>{isReadOnly ? 'Phiếu này chỉ được xem.' : 'Kiểm tra kỹ trước khi xác nhận tổng kết.'}</span>
          </div>
          <div className="mrm-footer-actions">
            <button className="mrm-btn-cancel" onClick={onClose} disabled={submitting}>
              {isReadOnly ? 'Đóng' : 'Hủy'}
            </button>
            {!isReadOnly && (
              <button
                className="mrm-btn-approve"
                style={{ backgroundColor: '#3b82f6' }}
                onClick={handleSubmit}
                disabled={submitting || loading || !!error}
              >
                {submitting ? 'Đang gửi...' : 'Xác nhận tổng kết'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
