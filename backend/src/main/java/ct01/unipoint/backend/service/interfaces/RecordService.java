package ct01.unipoint.backend.service.interfaces;

import java.util.Map;

public interface RecordService {

  Map<String, Double> calculateAutoScores(Long studentId, Long semesterId);
}