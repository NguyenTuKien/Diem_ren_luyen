package ct01.unipoint.backend.service;

import ct01.unipoint.backend.dto.monitor.MonitorClassListResponse;

public interface MonitorClassService {

  MonitorClassListResponse getManagedClassMembers(Long monitorUserId);
}
