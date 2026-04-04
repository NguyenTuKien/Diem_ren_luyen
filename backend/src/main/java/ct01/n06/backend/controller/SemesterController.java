package ct01.n06.backend.controller;

import ct01.n06.backend.entity.SemesterEntity;
import ct01.n06.backend.service.SemesterService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/semesters")
@RequiredArgsConstructor
public class SemesterController {
    private final SemesterService semesterService;

    @GetMapping("")
    public final List<SemesterEntity> getAllSemesters(){
        return semesterService.getAllSemesters();
    }
}
