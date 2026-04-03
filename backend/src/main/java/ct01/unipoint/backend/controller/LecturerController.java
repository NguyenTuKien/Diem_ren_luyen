package ct01.unipoint.backend.controller;

import ct01.unipoint.backend.dto.common.SimpleMessageResponse;
import ct01.unipoint.backend.dto.lecturer.ImportStudentsResponse;
import ct01.unipoint.backend.dto.lecturer.LecturerStudentListResponse;
import ct01.unipoint.backend.dto.lecturer.LecturerStudentOptionsResponse;
import ct01.unipoint.backend.dto.lecturer.LecturerStudentRowResponse;
import ct01.unipoint.backend.dto.lecturer.ManualCreateStudentRequest;
import ct01.unipoint.backend.dto.lecturer.UpdateStudentStatusRequest;
import ct01.unipoint.backend.service.LecturerService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/lecturer/students")
public class LecturerController {

  private final LecturerService lecturerService;

  public LecturerController(
      LecturerService lecturerService
  ) {
    this.lecturerService = lecturerService;
  }

  @GetMapping("/options")
  public LecturerStudentOptionsResponse options(@RequestParam String lecturerId) {
    String resolvedLecturerId = lecturerService.ensureLecturerAccessForCurrentUser(lecturerId);
    return lecturerService.getOptions(resolvedLecturerId);
  }

  @GetMapping
  public LecturerStudentListResponse list(
      @RequestParam String lecturerId,
      @RequestParam(required = false) Long facultyId,
      @RequestParam(required = false) Long classId,
      @RequestParam(required = false) String status,
      @RequestParam(required = false) String keyword
  ) {
    String resolvedLecturerId = lecturerService.ensureLecturerAccessForCurrentUser(lecturerId);
    return lecturerService.getStudents(resolvedLecturerId, facultyId, classId, status, keyword);
  }

  @PostMapping("/manual")
  public LecturerStudentRowResponse createManual(
      @RequestParam String lecturerId,
      @RequestBody ManualCreateStudentRequest request
  ) {
    String resolvedLecturerId = lecturerService.ensureLecturerAccessForCurrentUser(lecturerId);
    return lecturerService.createManualStudent(resolvedLecturerId, request);
  }

  @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ImportStudentsResponse importExcel(
      @RequestParam String lecturerId,
      @RequestPart("file") MultipartFile file
  ) {
    String resolvedLecturerId = lecturerService.ensureLecturerAccessForCurrentUser(lecturerId);
    return lecturerService.importStudents(resolvedLecturerId, file);
  }

  @PutMapping("/{studentId}/monitor")
  public LecturerStudentRowResponse assignMonitor(
      @RequestParam String lecturerId,
      @PathVariable String studentId
  ) {
    String resolvedLecturerId = lecturerService.ensureLecturerAccessForCurrentUser(lecturerId);
    return lecturerService.assignMonitor(resolvedLecturerId, studentId);
  }

  @PutMapping("/{studentId}/status")
  public LecturerStudentRowResponse updateStatus(
      @RequestParam String lecturerId,
      @PathVariable String studentId,
      @RequestBody UpdateStudentStatusRequest request
  ) {
    String resolvedLecturerId = lecturerService.ensureLecturerAccessForCurrentUser(lecturerId);
    return lecturerService.updateStudentStatus(resolvedLecturerId, studentId, request.status());
  }

  @DeleteMapping("/{studentId}")
  public SimpleMessageResponse delete(
      @RequestParam String lecturerId,
      @PathVariable String studentId
  ) {
    String resolvedLecturerId = lecturerService.ensureLecturerAccessForCurrentUser(lecturerId);
    return lecturerService.deleteStudent(resolvedLecturerId, studentId);
  }
}

