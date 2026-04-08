package ct01.n06.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ct01.n06.backend.dto.lecturer.LecturerDashboardSummaryResponse;
import ct01.n06.backend.service.LecturerService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/lecturer/dashboard")
@RequiredArgsConstructor
public class LecturerDashboardController {

  private final LecturerService lecturerService;

  @GetMapping
  public LecturerDashboardSummaryResponse getSummary() {
    return lecturerService.getDashboardSummary();
  }
}
