package ct01.unipoint.backend.dao;

import ct01.unipoint.backend.entity.UserEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserDao extends JpaRepository<UserEntity, String> {
  Optional<UserEntity> findByUsername(String username);

  Optional<UserEntity> findByEmail(String email);
}
