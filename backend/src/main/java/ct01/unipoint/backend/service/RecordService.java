package ct01.unipoint.backend.service;

import java.util.Map;

public interface RecordService {

  Map<String, Double> calculateAutoScores(String studentId, Long semesterId);
}

