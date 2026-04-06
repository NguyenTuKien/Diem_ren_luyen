package ct01.n06.backend.mapper;

import ct01.n06.backend.dto.event.EventRequest;
import ct01.n06.backend.dto.event.EventResponse;
import ct01.n06.backend.entity.CriteriaEntity;
import ct01.n06.backend.entity.EventEntity;
import ct01.n06.backend.entity.SemesterEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EventMapper {

    @Mapping(target = "semesterId", source = "semester.id")
    @Mapping(target = "criteriaId", source = "criteria.id")
    @Mapping(target = "createdByUserId", source = "createdBy.id")
    EventResponse toResponse(EventEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "semester", expression = "java(toSemesterEntity(request.getSemesterId()))")
    @Mapping(target = "criteria", expression = "java(toCriteriaEntity(request.getCriteriaId()))")
    EventEntity toEntity(EventRequest request);

    // For partial updates without touching relationships or creator
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "semester", ignore = true)
    @Mapping(target = "criteria", ignore = true)
    void updateEntityFromRequest(EventRequest request, @MappingTarget EventEntity entity);

    default SemesterEntity toSemesterEntity(Long semesterId) {
        if (semesterId == null) {
            return null;
        }
        SemesterEntity semester = new SemesterEntity();
        semester.setId(semesterId);
        return semester;
    }

    default CriteriaEntity toCriteriaEntity(Long criteriaId) {
        if (criteriaId == null) {
            return null;
        }
        CriteriaEntity criteria = new CriteriaEntity();
        criteria.setId(criteriaId);
        return criteria;
    }
}
