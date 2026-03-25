package ct01.unipoint.backend.repository;

import ct01.unipoint.backend.entity.StudentEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentRepository extends JpaRepository<StudentEntity, Long> {

  @EntityGraph(attributePaths = {"userEntity", "classEntity", "classEntity.facultyEntity"})
  Optional<StudentEntity> findByUserEntityId(Long userId);

  Optional<StudentEntity> findByStudentCodeIgnoreCase(String studentCode);

  @Query("""
      select s
      from StudentEntity s
      join fetch s.userEntity u
      join fetch s.classEntity c
      left join fetch c.facultyEntity f
      left join c.lecturerEntity l
      where l.id = :lecturerId
      """)
  List<StudentEntity> findAllByLecturerIdWithDetails(@Param("lecturerId") Long lecturerId);

  @Query("""
      select s
      from StudentEntity s
      join fetch s.userEntity u
      join fetch s.classEntity c
      left join fetch c.facultyEntity f
      where c.id = :classId
      """)
  List<StudentEntity> findAllByClassIdWithDetails(@Param("classId") Long classId);
}
