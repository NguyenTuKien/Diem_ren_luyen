package ct01.unipoint.backend.controller;

import ct01.unipoint.backend.entity.SemesterEntity;
import ct01.unipoint.backend.service.SemesterService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/semesters")
@AllArgsConstructor
public class SemesterController {
    private final SemesterService semesterService;

    @GetMapping("")
    public final List<SemesterEntity> getAllSemesters(){
        return semesterService.getAllSemesters();
    }
}
