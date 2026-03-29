package ct01.unipoint.backend.service.impl;

import ct01.unipoint.backend.dao.SemesterDao;
import ct01.unipoint.backend.entity.SemesterEntity;
import ct01.unipoint.backend.service.SemesterService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class SemesterServiceImpl implements SemesterService {

    private final SemesterDao semesterDao;

    @Override
    public List<SemesterEntity> getAllSemesters() {
        return semesterDao.findAll();
    }
}
