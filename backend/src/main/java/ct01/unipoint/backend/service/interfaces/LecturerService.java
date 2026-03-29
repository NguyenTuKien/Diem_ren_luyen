package ct01.unipoint.backend.service.interfaces;

import ct01.unipoint.backend.entity.LecturerEntity;

public interface LecturerService {

  LecturerEntity getLecturerByUsername(String username);
}