package ct01.n06.backend.service;

import ct01.n06.backend.dto.monitor.MonitorClassListResponse;

public interface MonitorService {

  MonitorClassListResponse getManagedClassMembers(String monitorUserId);
}
