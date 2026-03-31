package ct01.unipoint.backend.service;

import ct01.unipoint.backend.dao.StudentDao;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.entity.UserEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class StudentService {
    private final StudentDao studentDao;

    public StudentEntity getStudentByUser(UserEntity userEntity) {
        return studentDao.findByUserEntity(userEntity).orElseThrow();
    }
}
