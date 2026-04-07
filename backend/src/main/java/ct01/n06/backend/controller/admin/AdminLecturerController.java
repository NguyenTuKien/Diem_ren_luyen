package ct01.n06.backend.controller.admin;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ct01.n06.backend.dto.admin.AdminLecturerCreateRequest;
import ct01.n06.backend.dto.admin.AdminLecturerListResponse;
import ct01.n06.backend.dto.admin.AdminLecturerOptionsResponse;
import ct01.n06.backend.dto.admin.AdminLecturerRowResponse;
import ct01.n06.backend.dto.admin.AdminLecturerStatsResponse;
import ct01.n06.backend.dto.admin.AdminLecturerUpdateRequest;
import ct01.n06.backend.service.AdminLecturerService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/admin/lecturers")
@RequiredArgsConstructor
public class AdminLecturerController {

  private final AdminLecturerService adminLecturerService;

  @GetMapping("/options")
  public AdminLecturerOptionsResponse options() {
    return adminLecturerService.getOptions();
  }

  @GetMapping
  public AdminLecturerListResponse list(
      @RequestParam(required = false) Long facultyId,
      @RequestParam(required = false) String status,
      @RequestParam(required = false) String keyword
  ) {
    return adminLecturerService.getLecturers(facultyId, status, keyword);
  }

  @GetMapping("/stats")
  public AdminLecturerStatsResponse stats() {
    return adminLecturerService.getStats();
  }

  @PostMapping
  public AdminLecturerRowResponse create(@RequestBody AdminLecturerCreateRequest request) {
    return adminLecturerService.createLecturer(request);
  }

  @PutMapping("/{lecturerId}")
  public AdminLecturerRowResponse update(
      @PathVariable String lecturerId,
      @RequestBody AdminLecturerUpdateRequest request
  ) {
    return adminLecturerService.updateLecturer(lecturerId, request);
  }

  @DeleteMapping("/{lecturerId}")
  public void delete(@PathVariable String lecturerId) {
    adminLecturerService.deleteLecturer(lecturerId);
  }
}