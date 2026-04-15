package ct01.n06.backend.controller.lecturer;

import ct01.n06.backend.dto.lecturer.LecturerClassStatisticsResponse;
import ct01.n06.backend.service.LecturerStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/lecturer/classes")
@RequiredArgsConstructor
public class LecturerClassStatisticsController {

  private final LecturerStatisticsService lecturerStatisticsService;

  @GetMapping("/{classId}/statistics")
  public LecturerClassStatisticsResponse getClassStatistics(
      @PathVariable Long classId,
      @RequestParam(required = false) Long semesterId
  ) {
    return lecturerStatisticsService.getClassStatistics(classId, semesterId);
  }

  @GetMapping("/{classId}/statistics/export")
  public ResponseEntity<byte[]> exportClassStatistics(
      @PathVariable Long classId,
      @RequestParam(required = false) Long semesterId
  ) {
    LecturerClassStatisticsResponse stats = lecturerStatisticsService.getClassStatistics(classId, semesterId);
    byte[] fileBytes = lecturerStatisticsService.exportClassStatisticsExcel(classId, semesterId);

    String fileName = "bao-cao-lop-" + stats.classCode() + "-" + stats.semesterName() + ".xlsx";

    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
        .header(HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.attachment().filename(fileName).build().toString())
        .body(fileBytes);
  }
}
