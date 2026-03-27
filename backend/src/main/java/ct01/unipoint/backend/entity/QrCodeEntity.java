package ct01.unipoint.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;
import org.springframework.data.redis.core.index.Indexed;

import java.util.concurrent.TimeUnit;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@RedisHash("QrCode")
public class QrCodeEntity {

    @Id
    private String qrToken;

    private Long eventId;

    @Indexed
    private String pinCode;

    @TimeToLive(unit = TimeUnit.SECONDS)
    private Long timeToLive;
}