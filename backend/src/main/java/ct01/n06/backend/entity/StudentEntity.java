package ct01.n06.backend.entity;

import ct01.n06.backend.constant.StudentConstant;
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
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = StudentConstant.TABLE_NAME)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
@Builder
public class StudentEntity extends BaseJpaAuditingEntity {

  @Id
  @Column(name = StudentConstant.COL_ID)
  private String id;

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private UserEntity userEntity;

  @Column(name = StudentConstant.COL_STUDENT_CODE, length = 20, unique = true, nullable = false)
  private String studentCode;

  @Column(name = StudentConstant.COL_FULL_NAME, length = 100, nullable = false)
  private String fullName;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = StudentConstant.COL_CLASS_ID)
  private ClassEntity classEntity;

  @PrePersist
  @PreUpdate
  private void syncIdFromUser() {
    if (this.userEntity != null) {
      this.id = this.userEntity.getId();
    }
  }
}