package ct01.n06.backend.service.impl;

import ct01.n06.backend.repository.CriteriaRepository;
import ct01.n06.backend.entity.CriteriaEntity;
import ct01.n06.backend.service.CriteriaService;
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
