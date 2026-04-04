package ct01.unipoint.backend.dao;

import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.entity.UserEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentDao extends JpaRepository<StudentEntity, String> {

  Optional<StudentEntity> findByStudentCode(String studentCode);

  Optional<StudentEntity> findByStudentCodeIgnoreCase(String studentCode);

  Optional<StudentEntity> findByUserEntity(UserEntity userEntity);

  Optional<StudentEntity> findByUserEntityId(String userId);

  Optional<StudentEntity> findByUserEntity_Username(String username);

  List<StudentEntity> findByClassEntity_Id(Long classId);

  @EntityGraph(attributePaths = {"userEntity", "classEntity", "classEntity.facultyEntity"})
  List<StudentEntity> findAllByClassEntityId(Long classId);

  @Query("""
      select s
      from StudentEntity s
      join fetch s.userEntity u
      join fetch s.classEntity c
      left join fetch c.facultyEntity f
      left join c.lecturerEntity l
      where l.id = :lecturerId
      """)
  List<StudentEntity> findAllByLecturerIdWithDetails(@Param("lecturerId") String lecturerId);
}
