package ct01.n06.backend.service;

import ct01.n06.backend.dto.response.ClassResponse;
import ct01.n06.backend.dto.admin.AdminClassCreateRequest;

public interface AdminClassService {

  ClassResponse createClass(AdminClassCreateRequest request);
}