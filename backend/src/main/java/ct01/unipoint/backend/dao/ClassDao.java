package ct01.unipoint.backend.dao;

import ct01.unipoint.backend.entity.ClassEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassDao extends JpaRepository<ClassEntity, Long> {

  @EntityGraph(attributePaths = {"facultyEntity", "monitor"})
  List<ClassEntity> findByLecturerEntityId(Long lecturerId);

  Optional<ClassEntity> findByClassCodeIgnoreCase(String classCode);

  Optional<ClassEntity> findByMonitor_Id(Long monitorId);

  @EntityGraph(attributePaths = {"facultyEntity", "monitor"})
  Optional<ClassEntity> findByIdAndLecturerEntityId(Long id, Long lecturerId);

  @EntityGraph(attributePaths = {"facultyEntity"})
  List<ClassEntity> findAllByOrderByClassCodeAsc();
}

