package ct01.unipoint.backend.service.impl;

import ct01.unipoint.backend.dao.LecturerDao;
import ct01.unipoint.backend.entity.LecturerEntity;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.service.LecturerService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class LecturerServiceImpl implements LecturerService {

    private final LecturerDao lecturerDao;

    @Override
    public LecturerEntity getLecturerByUser(UserEntity userEntity) {
        return lecturerDao.findByUserEntity(userEntity).orElseThrow();
    }
}

