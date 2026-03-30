package ct01.unipoint.backend.dao;

import ct01.unipoint.backend.entity.QrCodeEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QrCodeDao extends CrudRepository<QrCodeEntity, String> {
}