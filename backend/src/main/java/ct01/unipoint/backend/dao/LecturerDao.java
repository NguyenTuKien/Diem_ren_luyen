
package ct01.unipoint.backend.dao;

import ct01.unipoint.backend.entity.LecturerEntity;
import ct01.unipoint.backend.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LecturerDao extends JpaRepository<LecturerEntity, Long> {
    int countByUserEntity_Role(Role role);
}