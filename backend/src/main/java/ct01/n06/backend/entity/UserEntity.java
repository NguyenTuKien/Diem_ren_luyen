package ct01.n06.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import ct01.n06.backend.constant.UserConstant;
import ct01.n06.backend.entity.base.BaseJpaAuditingEntity;
import ct01.n06.backend.entity.enums.Role;
import ct01.n06.backend.entity.enums.UserStatus;
import jakarta.persistence.*;
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
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = UserConstant.COL_ID)
  private String id;
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
