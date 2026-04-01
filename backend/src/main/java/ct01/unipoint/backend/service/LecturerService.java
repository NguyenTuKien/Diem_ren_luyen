package ct01.unipoint.backend.service;

import ct01.unipoint.backend.entity.LecturerEntity;
import ct01.unipoint.backend.entity.UserEntity;

public interface LecturerService {
    LecturerEntity getLecturerByUser(UserEntity userEntity);
}

