package ct01.n06.backend.controller.admin;

import ct01.n06.backend.dto.admin.AdminStudentCreateRequest;
import ct01.n06.backend.dto.admin.AdminStudentListResponse;
import ct01.n06.backend.dto.admin.AdminStudentOptionsResponse;
import ct01.n06.backend.dto.admin.AdminStudentRowResponse;
import ct01.n06.backend.dto.admin.AdminStudentStatsResponse;
import ct01.n06.backend.dto.admin.AdminStudentUpdateRequest;
import ct01.n06.backend.service.AdminStudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin/students")
@RequiredArgsConstructor
public class AdminStudentController {

  private final AdminStudentService adminStudentService;

  @GetMapping("/options")
  public AdminStudentOptionsResponse options() {
    return adminStudentService.getOptions();
  }

  @GetMapping
  public AdminStudentListResponse list(
      @RequestParam(required = false) Long facultyId,
      @RequestParam(required = false) Long classId,
      @RequestParam(required = false) String status,
      @RequestParam(required = false) String keyword
  ) {
    return adminStudentService.getStudents(facultyId, classId, status, keyword);
  }

  @GetMapping("/stats")
  public AdminStudentStatsResponse stats() {
    return adminStudentService.getStats();
  }

  @PostMapping
  public AdminStudentRowResponse create(@RequestBody AdminStudentCreateRequest request) {
    return adminStudentService.createStudent(request);
  }

  @PutMapping("/{studentId}")
  public AdminStudentRowResponse update(
      @PathVariable String studentId,
      @RequestBody AdminStudentUpdateRequest request
  ) {
    return adminStudentService.updateStudent(studentId, request);
  }

  @DeleteMapping("/{studentId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable String studentId) {
    adminStudentService.deleteStudent(studentId);
  }
}
