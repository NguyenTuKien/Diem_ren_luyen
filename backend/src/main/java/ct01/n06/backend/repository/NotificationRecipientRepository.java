package ct01.n06.backend.repository;

import ct01.n06.backend.entity.NotificationRecipientEntity;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRecipientRepository extends JpaRepository<NotificationRecipientEntity, Long> {

  @EntityGraph(attributePaths = {
      "notification",
      "notification.sender",
      "notification.classEntity"
  })
  Page<NotificationRecipientEntity> findByStudent_IdOrderByCreatedAtDesc(String studentId, Pageable pageable);

  long countByStudent_IdAndReadFalse(String studentId);

  Optional<NotificationRecipientEntity> findByIdAndStudent_Id(Long id, String studentId);

  boolean existsByNotification_IdAndStudent_Id(Long notificationId, String studentId);
}
