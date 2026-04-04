package ct01.n06.backend.repository;

import ct01.n06.backend.entity.NotificationEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
  Optional<NotificationEntity> findByTitle(String title);
}

