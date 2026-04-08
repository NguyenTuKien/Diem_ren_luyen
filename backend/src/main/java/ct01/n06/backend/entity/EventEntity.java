package ct01.n06.backend.entity;

import ct01.n06.backend.constant.EventConstant;
import jakarta.persistence.*;

import ct01.n06.backend.entity.base.BaseJpaAuditingEntity;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = EventConstant.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventEntity extends BaseJpaAuditingEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = EventConstant.COL_ID)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = EventConstant.COL_SEMESTER_ID, nullable = false)
  private SemesterEntity semester;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = EventConstant.COL_CRITERIA_ID, nullable = false)
  private CriteriaEntity criteria;

  @Column(name = EventConstant.COL_TITLE, length = 200, nullable = false)
  private String title;

  @Column(name = EventConstant.COL_ORGANIZER, length = 150)
  private String organizer;

  @Column(name = EventConstant.COL_DESCRIPTION, columnDefinition = "TEXT")
  private String description;

  @Column(name = EventConstant.COL_LOCATION, length = 200)
  private String location;

  @Column(name = EventConstant.COL_START_TIME, nullable = false)
  private LocalDateTime startTime;

  @Column(name = EventConstant.COL_END_TIME, nullable = false)
  private LocalDateTime endTime;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = EventConstant.COL_CREATED_BY)
  private UserEntity createdBy;
}