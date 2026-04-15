package ct01.n06.backend.controller.admin;

import ct01.n06.backend.dto.admin.AdminClassCreateRequest;
import ct01.n06.backend.dto.response.ClassResponse;
import ct01.n06.backend.service.AdminClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin/classes")
@RequiredArgsConstructor
public class AdminClassController {

  private final AdminClassService adminClassService;

  @PostMapping
  public ClassResponse create(@RequestBody AdminClassCreateRequest request) {
    return adminClassService.createClass(request);
  }
}