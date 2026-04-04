package ct01.n06.backend.entity;

import ct01.n06.backend.constant.LecturerConstant;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = LecturerConstant.TABLE_NAME)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class LecturerEntity {

  @Id
  private String id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = LecturerConstant.COL_ID)
  @MapsId
  private UserEntity userEntity;

  @Column(name = LecturerConstant.COL_CODE, nullable = false, unique = true, length = 20)
  private String lecturerCode;

  @Column(name = LecturerConstant.COL_NAME, nullable = false, length = 100)
  private String fullName;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = LecturerConstant.COL_FACULTY_ID)
  private FacultyEntity facultyEntity;
}
