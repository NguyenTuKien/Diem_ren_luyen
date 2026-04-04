package ct01.unipoint.backend.repository;

import ct01.unipoint.backend.entity.LecturerEntity;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.entity.enums.Role;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LecturerRepository extends JpaRepository<LecturerEntity, String> {

  int countByUserEntity_Role(Role role);

  Optional<LecturerEntity> findByUserEntity_EmailIgnoreCase(String email);

  Optional<LecturerEntity> findByUserEntity(UserEntity userEntity);

  @EntityGraph(attributePaths = {"facultyEntity"})
  Optional<LecturerEntity> findByUserEntityId(String userId);
  Optional<LecturerEntity> findByUserEntity_Username(String username);
}
