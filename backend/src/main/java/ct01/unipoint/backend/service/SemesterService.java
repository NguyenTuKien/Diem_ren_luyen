package ct01.unipoint.backend.service;

import ct01.unipoint.backend.dao.CriteriaDao;
import ct01.unipoint.backend.dao.SemesterDao;
import ct01.unipoint.backend.entity.SemesterEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class SemesterService {
    private final SemesterDao semesterDao;

    public final List<SemesterEntity> getAllSemesters() {
        return semesterDao.findAll();
    }
}
