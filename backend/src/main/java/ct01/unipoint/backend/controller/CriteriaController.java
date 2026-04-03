package ct01.unipoint.backend.controller;

import ct01.unipoint.backend.entity.CriteriaEntity;
import ct01.unipoint.backend.service.CriteriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/criterias")
@RequiredArgsConstructor
public class CriteriaController {
    private final CriteriaService criteriaService;

    @GetMapping("")
    public List<CriteriaEntity> getAllCriteria(){
        return criteriaService.getAllCriteria();
    }
}
