package ct01.unipoint.backend.service;

import ct01.unipoint.backend.dao.LecturerDao;
import ct01.unipoint.backend.entity.LecturerEntity;
import ct01.unipoint.backend.entity.UserEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class LecturerService {

    private final LecturerDao lecturerDao;

    public LecturerEntity getLecturerByUser(UserEntity userEntity) {
        return lecturerDao.findByUserEntity(userEntity).orElseThrow();
    }
}
