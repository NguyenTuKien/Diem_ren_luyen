package ct01.unipoint.backend.service.impl;

import ct01.unipoint.backend.dao.RecordDao;
import ct01.unipoint.backend.entity.RecordEntity;
import ct01.unipoint.backend.entity.enums.RecordStatus;
import ct01.unipoint.backend.service.interfaces.RecordService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecordServiceImpl implements RecordService {

  private final RecordDao recordDao;

  @Override
  public Map<String, Double> calculateAutoScores(final Long studentId, final Long semesterId) {
    final List<RecordEntity> records = this.recordDao.findByStudent_IdAndSemester_IdAndStatus(
        studentId, semesterId, RecordStatus.APPROVED
    );

    final Map<String, Double> autoScores = new HashMap<>();
    for (final RecordEntity record : records) {
      String criteriaCode = record.getCriteria().getCode();
      double point = record.getCriteria().getPointPerItem().doubleValue();
      autoScores.put(criteriaCode, autoScores.getOrDefault(criteriaCode, 0.0) + point);
    }
    return autoScores;
  }
}