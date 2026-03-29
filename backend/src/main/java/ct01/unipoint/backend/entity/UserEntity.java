package ct01.unipoint.backend.entity;

import ct01.unipoint.backend.constant.UserConstant;
import ct01.unipoint.backend.entity.base.BaseJpaAuditingEntity;
import ct01.unipoint.backend.entity.enums.Role;
import ct01.unipoint.backend.entity.enums.UserStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = UserConstant.TABLE_NAME)
public class UserEntity extends BaseJpaAuditingEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = UserConstant.COL_ID)
  private Long id;
  @Column(name = UserConstant.COL_USERNAME, unique = true, nullable = false, length = 50)
  private String username;
  @Column(name = UserConstant.COL_EMAIL, unique = true, nullable = false, length = 100)
  private String email;
  @Column(name = UserConstant.COL_PASSWORD, unique = false, nullable = false, length = 255)
  @JsonIgnore
  private String password;
  @Enumerated(EnumType.STRING)
  @Column(name = UserConstant.COL_ROLE, length = 20, nullable = false)
  private Role role;
  @Enumerated(EnumType.STRING)
  @Column(name = UserConstant.COL_STATUS, length = 20)
  private UserStatus status;
}
