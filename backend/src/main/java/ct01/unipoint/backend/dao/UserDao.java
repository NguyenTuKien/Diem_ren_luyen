package ct01.unipoint.backend.dao;

import ct01.unipoint.backend.entity.UserEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserDao extends JpaRepository<UserEntity, Long> {
  Optional<UserEntity> findByUsernameIgnoreCase(String username);

  Optional<UserEntity> findByEmailIgnoreCase(String email);

  boolean existsByEmailIgnoreCase(String email);

  boolean existsByUsernameIgnoreCase(String username);
}
