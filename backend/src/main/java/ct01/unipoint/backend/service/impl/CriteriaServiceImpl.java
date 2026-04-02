package ct01.unipoint.backend.service.impl;

import ct01.unipoint.backend.dao.CriteriaDao;
import ct01.unipoint.backend.entity.CriteriaEntity;
import ct01.unipoint.backend.service.CriteriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CriteriaServiceImpl implements CriteriaService {

    private final CriteriaDao criteriaDao;

    @Override
    public List<CriteriaEntity> getAllCriteria() {
        return criteriaDao.findAll();
    }
}
