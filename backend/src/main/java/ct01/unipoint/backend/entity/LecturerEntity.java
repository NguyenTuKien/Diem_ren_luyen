package ct01.unipoint.backend.entity;

import ct01.unipoint.backend.constant.LecturerConstant;
import ct01.unipoint.backend.constant.UserConstant;
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
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = LecturerConstant.COL_USER_ID, unique = true, nullable = false)
  private UserEntity userEntity;

  @Column(name = LecturerConstant.COL_CODE, nullable = false, unique = true, length = 20)
  private String lecturerCode;

  @Column(name = LecturerConstant.COL_NAME, nullable = false, length = 100)
  private String fullName;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = LecturerConstant.COL_FACULTY_ID)
  private FacultyEntity facultyEntity;
}
