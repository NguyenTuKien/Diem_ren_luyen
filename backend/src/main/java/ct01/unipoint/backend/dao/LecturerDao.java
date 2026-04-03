
package ct01.unipoint.backend.dao;

import ct01.unipoint.backend.entity.LecturerEntity;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.entity.enums.Role;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LecturerDao extends JpaRepository<LecturerEntity, Long> {

    int countByUserEntity_Role(Role role);

    Optional<LecturerEntity> findByUserEntity_EmailIgnoreCase(String email);

    Optional<LecturerEntity> findByUserEntity(UserEntity userEntity);

    @EntityGraph(attributePaths = {"facultyEntity"})
    Optional<LecturerEntity> findByUserEntityId(Long userId);
}