package ct01.unipoint.backend.service.impl;

import ct01.unipoint.backend.dao.LecturerDao;
import ct01.unipoint.backend.entity.LecturerEntity;
import ct01.unipoint.backend.exception.business.ResourceNotFoundException;
import ct01.unipoint.backend.service.interfaces.LecturerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LecturerServiceImpl implements LecturerService {

  private final LecturerDao lecturerDao;

  @Override
  public LecturerEntity getLecturerByUsername(final String username) {
    return this.lecturerDao.findByUserEntity_Username(username)
        .orElseThrow(() -> new ResourceNotFoundException("Lecturer profile for user: " + username));
  }
}