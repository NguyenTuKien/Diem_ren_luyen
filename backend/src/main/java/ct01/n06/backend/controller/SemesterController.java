package ct01.n06.backend.controller;

import ct01.n06.backend.dto.ResponseGeneral;
import ct01.n06.backend.dto.response.SemesterResponse;
import ct01.n06.backend.service.SemesterService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/semesters")
@RequiredArgsConstructor
public class SemesterController {

  private final SemesterService semesterService;

  @GetMapping("")
  public ResponseGeneral<List<SemesterResponse>> getAllSemesters() {
    return ResponseGeneral.ofSuccess("Get all semesters successfully",
        semesterService.getAllSemesterResponses());
  }
}
