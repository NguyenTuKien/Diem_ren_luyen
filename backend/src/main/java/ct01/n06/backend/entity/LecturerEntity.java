package ct01.n06.backend.entity;

import ct01.n06.backend.constant.LecturerConstant;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
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
  @Column(name = LecturerConstant.COL_ID)
  private String id;

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private UserEntity userEntity;

  @Column(name = LecturerConstant.COL_CODE, nullable = false, unique = true, length = 20)
  private String lecturerCode;

  @Column(name = LecturerConstant.COL_NAME, nullable = false, length = 100)
  private String fullName;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = LecturerConstant.COL_FACULTY_ID)
  private FacultyEntity facultyEntity;

  @PrePersist
  @PreUpdate
  private void syncIdFromUser() {
    if (this.userEntity != null) {
      this.id = this.userEntity.getId();
    }
  }
}
