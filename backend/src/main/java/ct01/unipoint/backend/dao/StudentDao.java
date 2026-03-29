package ct01.unipoint.backend.dao;

import ct01.unipoint.backend.entity.StudentEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentDao extends JpaRepository<StudentEntity, Long> {

  Optional<StudentEntity> findByStudentCode(String studentCode);

  Optional<StudentEntity> findByUserEntity_Username(String username);

  List<StudentEntity> findByClassEntity_Id(Long classId);
}

