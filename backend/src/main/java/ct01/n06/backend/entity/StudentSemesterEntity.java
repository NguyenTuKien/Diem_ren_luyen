package ct01.n06.backend.entity;

import ct01.n06.backend.constant.EvalConstant;
import ct01.n06.backend.entity.enums.SemesterEvaluationStatus;
import ct01.n06.backend.entity.base.BaseJpaAuditingEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.Map;

@Entity
@Table(name = EvalConstant.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class StudentSemesterEntity extends BaseJpaAuditingEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = EvalConstant.COL_ID)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = EvalConstant.COL_STUDENT_ID)
  private StudentEntity student;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = EvalConstant.COL_SEMESTER_ID)
  private SemesterEntity semester;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = EvalConstant.COL_DETAILS_JSONB, columnDefinition = "jsonb")
  private Map<String, Double> detailsJsonb;

  @Column(name = EvalConstant.COL_FINAL_SCORE)
  private Integer finalScore;

  @Enumerated(EnumType.STRING)
  @Column(name = EvalConstant.COL_STATUS, length = 30)
  private SemesterEvaluationStatus status;
}