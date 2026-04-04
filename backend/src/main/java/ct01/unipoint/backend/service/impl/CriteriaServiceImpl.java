package ct01.unipoint.backend.service.impl;

import ct01.unipoint.backend.repository.CriteriaRepository;
import ct01.unipoint.backend.entity.CriteriaEntity;
import ct01.unipoint.backend.service.CriteriaService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class CriteriaServiceImpl implements CriteriaService {
    private final CriteriaRepository criteriaRepository;

    @Override
    public List<CriteriaEntity> getAllCriteria() {
        return criteriaRepository.findAll();
    }
}
