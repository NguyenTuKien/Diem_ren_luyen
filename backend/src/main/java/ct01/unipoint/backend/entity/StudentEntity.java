package ct01.unipoint.backend.entity;

import ct01.unipoint.backend.constant.StudentConstant;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = StudentConstant.TABLE_NAME)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StudentEntity {

  @Id
  @Column(name = StudentConstant.COL_ID)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @MapsId
  @JoinColumn(name = StudentConstant.COL_ID)
  private UserEntity userEntity;

  @Column(name = StudentConstant.COL_STUDENT_CODE, length = 20, unique = true, nullable = false)
  private String studentCode;

  @Column(name = StudentConstant.COL_FULL_NAME, length = 100, nullable = false)
  private String fullName;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = StudentConstant.COL_CLASS_ID)
  private ClassEntity classEntity;
}