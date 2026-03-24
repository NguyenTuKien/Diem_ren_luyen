package ct01.unipoint.backend.entity;

import ct01.unipoint.backend.constant.QrCodeConstant;
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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = QrCodeConstant.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QrCodeEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = QrCodeConstant.COL_ID)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = QrCodeConstant.COL_EVENT_ID)
  private EventEntity event;

  @Column(name = QrCodeConstant.COL_QR_TOKEN, length = 255, unique = true, nullable = false)
  private String qrToken;

  @Column(name = QrCodeConstant.COL_PIN_CODE, length = 10, unique = true, nullable = false)
  private String pinCode;

  @Column(name = QrCodeConstant.COL_EXPIRE_AT, nullable = false)
  private LocalDateTime expireAt;
}