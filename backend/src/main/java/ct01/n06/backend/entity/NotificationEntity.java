package ct01.n06.backend.entity;

import ct01.n06.backend.constant.NotificationConstant;
import ct01.n06.backend.entity.base.BaseJpaAuditingEntity;
import ct01.n06.backend.entity.enums.NotificationType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = NotificationConstant.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@Builder
public class NotificationEntity extends BaseJpaAuditingEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = NotificationConstant.COL_ID)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = NotificationConstant.COL_SENDER_ID)
  private UserEntity sender;

  @Column(name = NotificationConstant.COL_TITLE, length = 200, nullable = false)
  private String title;

  @Enumerated(EnumType.STRING)
  @Column(name = NotificationConstant.COL_TARGET_TYPE, length = 20, nullable = false)
  private NotificationType targetType;

}