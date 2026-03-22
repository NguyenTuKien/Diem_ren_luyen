package ct01.unipoint.backend.controller;

import ct01.unipoint.backend.dto.common.SimpleMessageResponse;
import ct01.unipoint.backend.dto.lecturer.ImportStudentsResponse;
import ct01.unipoint.backend.dto.lecturer.LecturerStudentListResponse;
import ct01.unipoint.backend.dto.lecturer.LecturerStudentOptionsResponse;
import ct01.unipoint.backend.dto.lecturer.LecturerStudentRowResponse;
import ct01.unipoint.backend.dto.lecturer.ManualCreateStudentRequest;
import ct01.unipoint.backend.dto.lecturer.UpdateStudentStatusRequest;
import ct01.unipoint.backend.service.LecturerStudentService;
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
@RequestMapping("/api/lecturer/students")
public class LecturerStudentController {

  private final LecturerStudentService lecturerStudentService;

  public LecturerStudentController(LecturerStudentService lecturerStudentService) {
    this.lecturerStudentService = lecturerStudentService;
  }

  @GetMapping("/options")
  public LecturerStudentOptionsResponse options(@RequestParam Long lecturerId) {
    return lecturerStudentService.getOptions(lecturerId);
  }

  @GetMapping
  public LecturerStudentListResponse list(
      @RequestParam Long lecturerId,
      @RequestParam(required = false) Long facultyId,
      @RequestParam(required = false) Long classId,
      @RequestParam(required = false) String status,
      @RequestParam(required = false) String keyword
  ) {
    return lecturerStudentService.getStudents(lecturerId, facultyId, classId, status, keyword);
  }

  @PostMapping("/manual")
  public LecturerStudentRowResponse createManual(
      @RequestParam Long lecturerId,
      @RequestBody ManualCreateStudentRequest request
  ) {
    return lecturerStudentService.createManualStudent(lecturerId, request);
  }

  @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ImportStudentsResponse importExcel(
      @RequestParam Long lecturerId,
      @RequestPart("file") MultipartFile file
  ) {
    return lecturerStudentService.importStudents(lecturerId, file);
  }

  @PutMapping("/{studentId}/monitor")
  public LecturerStudentRowResponse assignMonitor(
      @RequestParam Long lecturerId,
      @PathVariable Long studentId
  ) {
    return lecturerStudentService.assignMonitor(lecturerId, studentId);
  }

  @PutMapping("/{studentId}/status")
  public LecturerStudentRowResponse updateStatus(
      @RequestParam Long lecturerId,
      @PathVariable Long studentId,
      @RequestBody UpdateStudentStatusRequest request
  ) {
    return lecturerStudentService.updateStudentStatus(lecturerId, studentId, request.status());
  }

  @DeleteMapping("/{studentId}")
  public SimpleMessageResponse delete(
      @RequestParam Long lecturerId,
      @PathVariable Long studentId
  ) {
    return lecturerStudentService.deleteStudent(lecturerId, studentId);
  }
}
