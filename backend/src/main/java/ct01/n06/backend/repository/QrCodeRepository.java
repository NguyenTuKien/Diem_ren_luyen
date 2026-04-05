package ct01.n06.backend.repository;

import ct01.n06.backend.entity.QrCodeEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QrCodeRepository extends CrudRepository<QrCodeEntity, String> {
	Optional<QrCodeEntity> findByPinCode(String pinCode);
}