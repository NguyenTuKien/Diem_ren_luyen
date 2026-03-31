package ct01.unipoint.backend.dao;

import ct01.unipoint.backend.entity.ClassEntity;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassDao extends JpaRepository<ClassEntity, Long> {
  Optional<ClassEntity> findByClassCode(String classCode);

  List<ClassEntity> findByLecturerEntityId(String lecturerId);

  Optional<ClassEntity> findByMonitor_Id(String monitorId);

  Optional<ClassEntity> findByIdAndLecturerEntityId(Long id, String lecturerId);
}

