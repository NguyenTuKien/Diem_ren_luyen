package ct01.unipoint.backend.dao;

import ct01.unipoint.backend.entity.StudentEntity;
import java.util.Optional;

import ct01.unipoint.backend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentDao extends JpaRepository<StudentEntity, Long> {
  Optional<StudentEntity> findByStudentCode(String studentCode);

    Optional<StudentEntity> findByUserEntity(UserEntity userEntity);
}

