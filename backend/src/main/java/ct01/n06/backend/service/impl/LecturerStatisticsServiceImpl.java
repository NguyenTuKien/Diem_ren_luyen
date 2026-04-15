package ct01.n06.backend.service.impl;

import ct01.n06.backend.dto.lecturer.LecturerClassStatisticsResponse;
import ct01.n06.backend.dto.lecturer.LecturerClassStatisticsResponse.ScoreDistributionItem;
import ct01.n06.backend.dto.lecturer.LecturerClassStatisticsResponse.StudentStatisticItem;
import ct01.n06.backend.entity.ClassEntity;
import ct01.n06.backend.entity.SemesterEntity;
import ct01.n06.backend.entity.StudentEntity;
import ct01.n06.backend.entity.StudentSemesterEntity;
import ct01.n06.backend.entity.enums.RecordStatus;
import ct01.n06.backend.entity.enums.UserStatus;
import ct01.n06.backend.exception.ApiException;
import ct01.n06.backend.repository.ClassRepository;
import ct01.n06.backend.repository.RecordRepository;
import ct01.n06.backend.repository.SemesterRepository;
import ct01.n06.backend.repository.StudentRepository;
import ct01.n06.backend.repository.StudentSemesterRepository;
import ct01.n06.backend.service.LecturerStatisticsService;
import ct01.n06.backend.service.UserService;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LecturerStatisticsServiceImpl implements LecturerStatisticsService {

  private final UserService userService;
  private final ClassRepository classRepository;
  private final StudentRepository studentRepository;
  private final SemesterRepository semesterRepository;
  private final StudentSemesterRepository studentSemesterRepository;
  private final RecordRepository recordRepository;

  @Override
  @Transactional(readOnly = true)
  public LecturerClassStatisticsResponse getClassStatistics(Long classId, Long semesterId) {
    ClassStatisticsData data = buildStatisticsData(classId, semesterId);

    return new LecturerClassStatisticsResponse(
        data.classEntity().getId(),
        data.classEntity().getClassCode(),
        data.semester().getId(),
        data.semester().getName(),
        data.totalStudents(),
        data.participatedStudents(),
        data.participationRate(),
        data.distribution(),
        data.studentRows()
    );
  }

  @Override
  @Transactional(readOnly = true)
  public byte[] exportClassStatisticsExcel(Long classId, Long semesterId) {
    ClassStatisticsData data = buildStatisticsData(classId, semesterId);

    try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
      writeOverviewSheet(workbook, data);
      writeDistributionSheet(workbook, data);
      writeStudentDetailSheet(workbook, data);

      workbook.write(output);
      return output.toByteArray();
    } catch (IOException ex) {
      log.error("Xuất Excel thống kê lớp thất bại: classId={}, semesterId={}", classId, semesterId, ex);
      throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể xuất báo cáo Excel.");
    }
  }

  private ClassStatisticsData buildStatisticsData(Long classId, Long semesterId) {
    if (classId == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "classId là bắt buộc.");
    }

    String lecturerId = userService.requireCurrentUserId();
    ClassEntity classEntity = classRepository.findByIdAndLecturerEntityId(classId, lecturerId)
        .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem thống kê lớp này."));

    SemesterEntity semester = resolveSemester(semesterId);

    List<StudentEntity> students = studentRepository.findAllByClassEntityId(classEntity.getId())
        .stream()
        .filter(student -> student.getUserEntity() != null)
        .filter(student -> student.getUserEntity().getStatus() != UserStatus.DELETED)
        .sorted(Comparator.comparing(StudentEntity::getFullName, String.CASE_INSENSITIVE_ORDER))
        .toList();

    int totalStudents = students.size();
    if (students.isEmpty()) {
      return new ClassStatisticsData(
          classEntity,
          semester,
          0,
          0,
          0,
          List.of(
              new ScoreDistributionItem("excellent", "Xuất sắc", 0, 0),
              new ScoreDistributionItem("good", "Tốt", 0, 0),
              new ScoreDistributionItem("fair", "Khá", 0, 0),
              new ScoreDistributionItem("average", "Trung bình", 0, 0)
          ),
          List.of()
      );
    }

    List<String> studentIds = students.stream().map(StudentEntity::getId).toList();

    Map<String, Integer> scoreByStudent = studentSemesterRepository
        .findBySemester_IdAndStudent_IdIn(semester.getId(), studentIds)
        .stream()
        .filter(eval -> eval.getStudent() != null && eval.getStudent().getId() != null)
        .collect(LinkedHashMap::new,
            (map, eval) -> map.putIfAbsent(eval.getStudent().getId(), safeScore(eval)),
            Map::putAll);

    Map<String, Long> joinedEventsByStudent = recordRepository
        .countEventJoinsBySemesterAndStudentIdsAndStatus(semester.getId(), studentIds, RecordStatus.APPROVED)
        .stream()
        .collect(LinkedHashMap::new,
            (map, projection) -> map.put(projection.getStudentId(), projection.getJoinedCount()),
            Map::putAll);

    long participatedStudents = joinedEventsByStudent.values().stream()
        .filter(count -> count != null && count > 0)
        .count();

    int excellent = 0;
    int good = 0;
    int fair = 0;
    int average = 0;

    List<StudentStatisticItem> rows = students.stream().map(student -> {
      int score = scoreByStudent.getOrDefault(student.getId(), 0);
      long joinedEvents = joinedEventsByStudent.getOrDefault(student.getId(), 0L);

      return new StudentStatisticItem(
          student.getId(),
          student.getStudentCode(),
          student.getFullName(),
          student.getUserEntity().getEmail(),
          score,
          rankLabel(score),
          joinedEvents
      );
    }).toList();

    for (StudentStatisticItem row : rows) {
      if (row.finalScore() >= 90) {
        excellent++;
      } else if (row.finalScore() >= 80) {
        good++;
      } else if (row.finalScore() >= 65) {
        fair++;
      } else {
        average++;
      }
    }

    List<ScoreDistributionItem> distribution = List.of(
        new ScoreDistributionItem("excellent", "Xuất sắc", excellent, toPercent(excellent, totalStudents)),
        new ScoreDistributionItem("good", "Tốt", good, toPercent(good, totalStudents)),
        new ScoreDistributionItem("fair", "Khá", fair, toPercent(fair, totalStudents)),
        new ScoreDistributionItem("average", "Trung bình", average, toPercent(average, totalStudents))
    );

    return new ClassStatisticsData(
        classEntity,
        semester,
        totalStudents,
        participatedStudents,
        toPercent(participatedStudents, totalStudents),
        distribution,
        rows
    );
  }

  private SemesterEntity resolveSemester(Long semesterId) {
    if (semesterId != null) {
      return semesterRepository.findById(semesterId)
          .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy học kỳ."));
    }

    return semesterRepository.findFirstByIsActiveTrueOrderByStartDateDesc()
        .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Không có học kỳ đang hoạt động."));
  }

  private void writeOverviewSheet(XSSFWorkbook workbook, ClassStatisticsData data) {
    Sheet sheet = workbook.createSheet("TongQuan");

    int rowIndex = 0;
    rowIndex = writeKeyValueRow(sheet, rowIndex, "Lớp", data.classEntity().getClassCode());
    rowIndex = writeKeyValueRow(sheet, rowIndex, "Học kỳ", data.semester().getName());
    rowIndex = writeKeyValueRow(sheet, rowIndex, "Tổng sinh viên", String.valueOf(data.totalStudents()));
    writeKeyValueRow(sheet, rowIndex, "Tỷ lệ tham gia sự kiện", data.participationRate() + "%");

    autosizeColumns(sheet, 0, 1);
  }

  private void writeDistributionSheet(XSSFWorkbook workbook, ClassStatisticsData data) {
    Sheet sheet = workbook.createSheet("PhoDiem");

    Row header = sheet.createRow(0);
    header.createCell(0).setCellValue("Mức điểm");
    header.createCell(1).setCellValue("Số lượng");
    header.createCell(2).setCellValue("Tỷ lệ (%)");

    int rowIndex = 1;
    for (ScoreDistributionItem item : data.distribution()) {
      Row row = sheet.createRow(rowIndex++);
      row.createCell(0).setCellValue(item.label());
      row.createCell(1).setCellValue(item.count());
      row.createCell(2).setCellValue(item.percentage());
    }

    autosizeColumns(sheet, 0, 2);
  }

  private void writeStudentDetailSheet(XSSFWorkbook workbook, ClassStatisticsData data) {
    Sheet sheet = workbook.createSheet("ChiTietSinhVien");

    Row header = sheet.createRow(0);
    header.createCell(0).setCellValue("Mã sinh viên");
    header.createCell(1).setCellValue("Họ và tên");
    header.createCell(2).setCellValue("Email");
    header.createCell(3).setCellValue("Điểm rèn luyện");
    header.createCell(4).setCellValue("Xếp loại");
    header.createCell(5).setCellValue("Số sự kiện đã tham gia");

    int rowIndex = 1;
    for (StudentStatisticItem item : data.studentRows()) {
      Row row = sheet.createRow(rowIndex++);
      row.createCell(0).setCellValue(item.studentCode());
      row.createCell(1).setCellValue(item.fullName());
      row.createCell(2).setCellValue(item.email());
      row.createCell(3).setCellValue(item.finalScore());
      row.createCell(4).setCellValue(item.rankLabel());
      row.createCell(5).setCellValue(item.joinedEvents());
    }

    autosizeColumns(sheet, 0, 5);
  }

  private int writeKeyValueRow(Sheet sheet, int rowIndex, String key, String value) {
    Row row = sheet.createRow(rowIndex);
    Cell keyCell = row.createCell(0);
    Cell valueCell = row.createCell(1);
    keyCell.setCellValue(key);
    valueCell.setCellValue(value != null ? value : "");
    return rowIndex + 1;
  }

  private void autosizeColumns(Sheet sheet, int from, int to) {
    for (int i = from; i <= to; i++) {
      sheet.autoSizeColumn(i);
    }
  }

  private int safeScore(StudentSemesterEntity evaluation) {
    return evaluation.getFinalScore() != null ? evaluation.getFinalScore() : 0;
  }

  private String rankLabel(int score) {
    if (score >= 90) {
      return "Xuất sắc";
    }
    if (score >= 80) {
      return "Tốt";
    }
    if (score >= 65) {
      return "Khá";
    }
    return "Trung bình";
  }

  private double toPercent(long value, long total) {
    if (total <= 0) {
      return 0;
    }
    return Math.round((value * 1000.0) / total) / 10.0;
  }

  private record ClassStatisticsData(
      ClassEntity classEntity,
      SemesterEntity semester,
      int totalStudents,
      long participatedStudents,
      double participationRate,
      List<ScoreDistributionItem> distribution,
      List<StudentStatisticItem> studentRows
  ) {
  }
}
