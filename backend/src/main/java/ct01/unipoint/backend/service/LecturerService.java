package ct01.unipoint.backend.service;

import org.springframework.web.multipart.MultipartFile;

import ct01.unipoint.backend.dto.common.SimpleMessageResponse;
import ct01.unipoint.backend.dto.lecturer.ImportStudentsResponse;
import ct01.unipoint.backend.dto.lecturer.LecturerStudentListResponse;
import ct01.unipoint.backend.dto.lecturer.LecturerStudentOptionsResponse;
import ct01.unipoint.backend.dto.lecturer.LecturerStudentRowResponse;
import ct01.unipoint.backend.dto.lecturer.ManualCreateStudentRequest;

public interface LecturerService {

  Long ensureLecturerAccessForCurrentUser(Long requestedLecturerId);

  LecturerStudentOptionsResponse getOptions(Long lecturerId);

  LecturerStudentListResponse getStudents(
      Long lecturerId,
      Long facultyId,
      Long classId,
      String status,
      String keyword
  );

  LecturerStudentRowResponse createManualStudent(Long lecturerId, ManualCreateStudentRequest request);

  ImportStudentsResponse importStudents(Long lecturerId, MultipartFile file);

  LecturerStudentRowResponse assignMonitor(Long lecturerId, Long studentId);

  LecturerStudentRowResponse updateStudentStatus(Long lecturerId, Long studentId, String status);

  SimpleMessageResponse deleteStudent(Long lecturerId, Long studentId);

    LecturerEntity getLecturerByUser(UserEntity userEntity);
}