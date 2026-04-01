package ct01.unipoint.backend.service.impl;

import ct01.unipoint.backend.dao.StudentDao;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.service.StudentService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class StudentServiceImpl implements StudentService {
    private final StudentDao studentDao;

    @Override
    public StudentEntity getStudentByUser(UserEntity userEntity) {
        return studentDao.findByUserEntity(userEntity).orElseThrow();
    }
}

