package ct01.n06.backend.service;

import ct01.n06.backend.dto.student.StudentDashboardResponse;
import ct01.n06.backend.dto.student.StudentActivityHistoryResponse;
import ct01.n06.backend.dto.student.StudentDashboardResponse.AttendedEventItem;
import ct01.n06.backend.dto.student.StudentDashboardResponse.UpcomingEventItem;
import ct01.n06.backend.dto.student.StudentScoreTrendResponse;
import ct01.n06.backend.entity.StudentEntity;
import ct01.n06.backend.entity.UserEntity;
import java.util.List;

public interface StudentService {
  StudentEntity getStudentByUser(UserEntity userEntity);

  StudentDashboardResponse getDashboard(String userId);

  List<UpcomingEventItem> getUpcomingEvents(String userId);

  List<AttendedEventItem> getAttendedEvents(String userId);

  StudentActivityHistoryResponse getActivityHistory(String userId, Long semesterId, int page, int size);

  StudentScoreTrendResponse getScoreTrend(String userId);

  StudentEntity getStudentByUsername(String username);

  List<StudentEntity> getStudentsByClassId(Long classId);
}
