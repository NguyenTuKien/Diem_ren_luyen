package ct01.unipoint.backend.repository;

import ct01.unipoint.backend.entity.QrCodeEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QrCodeRepository extends CrudRepository<QrCodeEntity, String> {
}