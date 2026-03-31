package ct01.unipoint.backend.service;

import ct01.unipoint.backend.dao.CriteriaDao;
import ct01.unipoint.backend.entity.CriteriaEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class CriteriaService {
    private final CriteriaDao criteriaDao;

    public final List<CriteriaEntity> getAllCriteria() {
        return criteriaDao.findAll();
    }
}
