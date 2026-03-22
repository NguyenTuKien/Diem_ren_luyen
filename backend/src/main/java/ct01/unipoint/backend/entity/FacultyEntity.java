package ct01.unipoint.backend.entity;

import ct01.unipoint.backend.constant.FacultyConstant;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = FacultyConstant.TABLE_NAME)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacultyEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = FacultyConstant.COL_ID)
  private Long id;
  @Column(name = FacultyConstant.COL_CODE, length = 25, unique = true, nullable = false)
  private String code;
  @Column(name = FacultyConstant.COL_NAME, length = 100, nullable = false)
  private String name;
}
