package ct01.unipoint.backend.service;

import ct01.unipoint.backend.dto.student.StudentDashboardResponse;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.entity.UserEntity;

public interface StudentService {
    StudentEntity getStudentByUser(UserEntity userEntity);
    StudentDashboardResponse getDashboard(String userId);
}