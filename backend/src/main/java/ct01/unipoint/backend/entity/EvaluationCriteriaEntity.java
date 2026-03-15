package ct01.unipoint.backend.entity;

import ct01.unipoint.backend.constant.CriteriaConstant;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = CriteriaConstant.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationCriteriaEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = CriteriaConstant.COL_ID)
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = CriteriaConstant.COL_SEMESTER_ID)
  private SemesterEntity semester;

  @Column(name = CriteriaConstant.COL_CODE, length = 10, nullable = false)
  private String code;

  @Column(name = CriteriaConstant.COL_NAME, length = 255, nullable = false)
  private String name;

  @Column(name = CriteriaConstant.COL_POINT_PER_ITEM, precision = 4, scale = 2, nullable = false)
  private BigDecimal pointPerItem;

  @Column(name = CriteriaConstant.COL_MAX_POINT, precision = 4, scale = 2, nullable = false)
  private BigDecimal maxPoint;

  @Column(name = CriteriaConstant.COL_REQUIRE_EVIDENCE)
  private Boolean requireEvidence;
}