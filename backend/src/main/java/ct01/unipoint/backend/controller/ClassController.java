package ct01.unipoint.backend.controller;

import ct01.unipoint.backend.dto.ResponseGeneral;
import ct01.unipoint.backend.dto.response.ClassResponse;
import ct01.unipoint.backend.service.interfaces.ClassService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/classes")
@RequiredArgsConstructor
public class ClassController {

  private final ClassService classService;

  @GetMapping("")
  public ResponseGeneral<List<ClassResponse>> getAll() {
    return ResponseGeneral.ofSuccess("Success", this.classService.getAllClasses());
  }
}