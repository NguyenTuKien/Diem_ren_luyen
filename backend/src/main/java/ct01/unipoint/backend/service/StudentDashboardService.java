package ct01.unipoint.backend.service;

import ct01.unipoint.backend.dto.student.StudentDashboardResponse;

public interface StudentDashboardService {

  StudentDashboardResponse getDashboard(Long userId);
}
