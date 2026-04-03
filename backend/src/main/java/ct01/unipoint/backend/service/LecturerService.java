package ct01.unipoint.backend.service;

import ct01.unipoint.backend.dto.common.SimpleMessageResponse;
import ct01.unipoint.backend.dto.lecturer.ImportStudentsResponse;
import ct01.unipoint.backend.dto.lecturer.LecturerStudentListResponse;
import ct01.unipoint.backend.dto.lecturer.LecturerStudentOptionsResponse;
import ct01.unipoint.backend.dto.lecturer.LecturerStudentRowResponse;
import ct01.unipoint.backend.dto.lecturer.ManualCreateStudentRequest;
import ct01.unipoint.backend.entity.LecturerEntity;
import ct01.unipoint.backend.entity.UserEntity;
import org.springframework.web.multipart.MultipartFile;

public interface LecturerService {

  String ensureLecturerAccessForCurrentUser(String requestedLecturerId);

  LecturerStudentOptionsResponse getOptions(String lecturerId);

  LecturerStudentListResponse getStudents(
      String lecturerId,
      Long facultyId,
      Long classId,
      String status,
      String keyword
  );

  LecturerStudentRowResponse createManualStudent(String lecturerId, ManualCreateStudentRequest request);

  ImportStudentsResponse importStudents(String lecturerId, MultipartFile file);

  LecturerStudentRowResponse assignMonitor(String lecturerId, String studentId);

  LecturerStudentRowResponse updateStudentStatus(String lecturerId, String studentId, String status);

  SimpleMessageResponse deleteStudent(String lecturerId, String studentId);

  LecturerEntity getLecturerByUser(UserEntity userEntity);
}
