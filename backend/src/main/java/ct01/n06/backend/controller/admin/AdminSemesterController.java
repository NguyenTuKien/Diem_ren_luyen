package ct01.n06.backend.controller.admin;

import ct01.n06.backend.dto.ResponseGeneral;
import ct01.n06.backend.dto.request.CreateSemesterRequest;
import ct01.n06.backend.dto.request.UpdateSemesterRequest;
import ct01.n06.backend.dto.response.SemesterResponse;
import ct01.n06.backend.service.SemesterService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin/semesters")
@RequiredArgsConstructor
public class AdminSemesterController {

  private final SemesterService semesterService;

  @GetMapping("")
  public ResponseGeneral<List<SemesterResponse>> getAll() {
    return ResponseGeneral.ofSuccess("Get all semesters successfully",
        semesterService.getAllSemesterResponses());
  }

  @PostMapping("")
  @ResponseStatus(HttpStatus.CREATED)
  public ResponseGeneral<SemesterResponse> create(@RequestBody final CreateSemesterRequest request) {
    return ResponseGeneral.ofSuccess("Semester created successfully",
        semesterService.createSemester(request));
  }

  @PutMapping("/{id}")
  public ResponseGeneral<SemesterResponse> update(
      @PathVariable final Long id,
      @RequestBody final UpdateSemesterRequest request) {
    return ResponseGeneral.ofSuccess("Semester updated successfully",
        semesterService.updateSemester(id, request));
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable final Long id) {
    semesterService.deleteSemester(id);
  }

  @PatchMapping("/{id}/activate")
  public ResponseGeneral<SemesterResponse> toggleActive(@PathVariable final Long id) {
    return ResponseGeneral.ofSuccess("Semester activation toggled",
        semesterService.toggleActive(id));
  }
}
