package ct01.unipoint.backend.dao;

import ct01.unipoint.backend.entity.QrCodeEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QrCodeDao extends JpaRepository<QrCodeEntity, Long> {
  Optional<QrCodeEntity> findByQrToken(String qrToken);
}

