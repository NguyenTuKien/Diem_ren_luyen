package ct01.n06.backend.entity;

import ct01.n06.backend.constant.ClassConstant;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import ct01.n06.backend.entity.base.BaseJpaAuditingEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = ClassConstant.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@Builder
public class ClassEntity extends BaseJpaAuditingEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = ClassConstant.COL_ID)
  private Long id;

  @Column(name = ClassConstant.COL_CLASS_CODE, length = 20, unique = true, nullable = false)
  private String classCode;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = ClassConstant.COL_MONITOR_ID, referencedColumnName = "id", unique = true)
  private StudentEntity monitor;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = ClassConstant.COL_FACULTY_ID)
  private FacultyEntity facultyEntity;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = ClassConstant.COL_LECTURER_ID)
  private LecturerEntity lecturerEntity;
}
