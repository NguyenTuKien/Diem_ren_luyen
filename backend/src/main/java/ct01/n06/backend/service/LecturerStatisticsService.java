package ct01.n06.backend.service;

import ct01.n06.backend.dto.lecturer.LecturerClassStatisticsResponse;

public interface LecturerStatisticsService {

  LecturerClassStatisticsResponse getClassStatistics(Long classId, Long semesterId);

  byte[] exportClassStatisticsExcel(Long classId, Long semesterId);
}
