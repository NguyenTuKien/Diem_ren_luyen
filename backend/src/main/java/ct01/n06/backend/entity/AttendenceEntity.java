package ct01.n06.backend.entity;

import ct01.n06.backend.entity.base.BaseJpaAuditingEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "attendent",
    uniqueConstraints = @UniqueConstraint(
        name = "uc_attendent_event_student",
        columnNames = {"event_id", "student_id"}
    )
)
@Getter
@Setter
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendenceEntity extends BaseJpaAuditingEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private EventEntity event;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private StudentEntity student;
}
