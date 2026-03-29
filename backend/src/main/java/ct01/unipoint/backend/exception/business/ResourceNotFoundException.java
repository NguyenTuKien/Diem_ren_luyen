package ct01.unipoint.backend.exception.business;

import ct01.unipoint.backend.exception.base.BusinessException;
import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends BusinessException {

  public static final String ERROR_CODE = "RESOURCE_NOT_FOUND";

  public ResourceNotFoundException(final String resourceName) {
    super(ERROR_CODE, HttpStatus.NOT_FOUND, resourceName + " not found in system");
  }
}