package ct01.n06.backend.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ct01.n06.backend.entity.NotificationEntity;
import ct01.n06.backend.entity.enums.NotificationType;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
  Optional<NotificationEntity> findByTitle(String title);

  long countByTargetTypeInAndCreatedAtAfter(Collection<NotificationType> targetTypes, LocalDateTime createdAt);

  long countBySender_IdAndCreatedAtAfter(String senderId, LocalDateTime createdAt);
}

