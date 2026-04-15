package ct01.n06.backend.service.impl;

import ct01.n06.backend.dto.admin.AdminClassCreateRequest;
import ct01.n06.backend.dto.response.ClassResponse;
import ct01.n06.backend.entity.ClassEntity;
import ct01.n06.backend.entity.FacultyEntity;
import ct01.n06.backend.entity.LecturerEntity;
import ct01.n06.backend.entity.enums.Role;
import ct01.n06.backend.exception.ApiException;
import ct01.n06.backend.repository.ClassRepository;
import ct01.n06.backend.repository.FacultyRepository;
import ct01.n06.backend.repository.LecturerRepository;
import ct01.n06.backend.service.AdminClassService;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AdminClassServiceImpl implements AdminClassService {

  private final ClassRepository classRepository;
  private final FacultyRepository facultyRepository;
  private final LecturerRepository lecturerRepository;

  @Override
  @Transactional
  public ClassResponse createClass(AdminClassCreateRequest request) {
    if (request == null || !StringUtils.hasText(request.classCode()) || request.facultyId() == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Thiếu thông tin bắt buộc: mã lớp và khoa.");
    }

    String classCode = request.classCode().trim().toUpperCase(Locale.ROOT);
    if (classRepository.findByClassCodeIgnoreCase(classCode).isPresent()) {
      throw new ApiException(HttpStatus.CONFLICT, "Mã lớp đã tồn tại: " + classCode);
    }

    FacultyEntity faculty = facultyRepository.findById(request.facultyId())
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy khoa được chọn."));

    LecturerEntity lecturer = null;
    if (StringUtils.hasText(request.lecturerId())) {
      lecturer = lecturerRepository.findById(request.lecturerId())
          .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy giảng viên được chọn."));
      if (lecturer.getUserEntity() == null || lecturer.getUserEntity().getRole() != Role.ROLE_LECTURER) {
        throw new ApiException(HttpStatus.BAD_REQUEST, "Giảng viên được chọn không hợp lệ.");
      }
    }

    ClassEntity classEntity = ClassEntity.builder()
        .classCode(classCode)
        .facultyEntity(faculty)
        .lecturerEntity(lecturer)
        .build();

    ClassEntity saved = classRepository.save(classEntity);
    return ClassResponse.builder()
        .id(saved.getId())
        .classCode(saved.getClassCode())
        .build();
  }
}