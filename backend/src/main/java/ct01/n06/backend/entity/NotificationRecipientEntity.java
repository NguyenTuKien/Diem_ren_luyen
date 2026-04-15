package ct01.n06.backend.entity;

import ct01.n06.backend.constant.NotificationRecipientConstant;
import ct01.n06.backend.entity.base.BaseJpaAuditingEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = NotificationRecipientConstant.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@Builder
public class NotificationRecipientEntity extends BaseJpaAuditingEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = NotificationRecipientConstant.COL_ID)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = NotificationRecipientConstant.COL_NOTIFICATION_ID, nullable = false)
  private NotificationEntity notification;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = NotificationRecipientConstant.COL_STUDENT_ID, nullable = false)
  private StudentEntity student;

  @Column(name = NotificationRecipientConstant.COL_IS_READ, nullable = false)
  private boolean read;

  @Column(name = NotificationRecipientConstant.COL_READ_AT)
  private LocalDateTime readAt;
}
