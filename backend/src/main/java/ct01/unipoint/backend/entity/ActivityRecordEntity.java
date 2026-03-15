package ct01.unipoint.backend.entity;

import ct01.unipoint.backend.constant.ActivityRecordConstant;
import ct01.unipoint.backend.entity.base.BaseJpaAuditingEntity;
import ct01.unipoint.backend.entity.enums.ActivityRecordStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = ActivityRecordConstant.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityRecordEntity extends BaseJpaAuditingEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = ActivityRecordConstant.COL_ID)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = ActivityRecordConstant.COL_STUDENT_ID, nullable = false)
  private StudentEntity student;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = ActivityRecordConstant.COL_SEMESTER_ID, nullable = false)
  private SemesterEntity semester;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = ActivityRecordConstant.COL_EVENT_ID)
  private EventEntity event;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = ActivityRecordConstant.COL_CRITERIA_ID)
  private EvaluationCriteriaEntity criteria;

  @Column(name = ActivityRecordConstant.COL_CUSTOM_NAME, length = 255)
  private String customName;

  @Column(name = ActivityRecordConstant.COL_EVIDENCE_URL, length = 500)
  private String evidenceUrl;

  @Column(name = ActivityRecordConstant.COL_ACTIVITY_TIME)
  private LocalDateTime activityTime;

  @Enumerated(EnumType.STRING)
  @Column(name = ActivityRecordConstant.COL_STATUS, length = 20)
  private ActivityRecordStatus status;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = ActivityRecordConstant.COL_APPROVER_ID)
  private UserEntity approver;
}