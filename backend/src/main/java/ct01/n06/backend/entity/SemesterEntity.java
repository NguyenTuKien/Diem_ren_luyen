package ct01.n06.backend.entity;

import ct01.n06.backend.constant.SemesterConstant;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = SemesterConstant.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SemesterEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = SemesterConstant.COL_ID)
  private Long id;

  @Column(name = SemesterConstant.COL_NAME, length = 20, unique = true, nullable = false)
  private String name;

  @Column(name = SemesterConstant.COL_START_DATE, nullable = false)
  private LocalDate startDate;

  @Column(name = SemesterConstant.COL_END_DATE, nullable = false)
  private LocalDate endDate;

  @Column(name = SemesterConstant.COL_IS_ACTIVE)
  private Boolean isActive;
}