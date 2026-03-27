package ct01.unipoint.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "attendent")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendenceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "event_id", unique = true)
    private EventEntity event;

    @ManyToOne
    @JoinColumn(name = "student_id", unique = true)
    private StudentEntity student;

    private LocalDateTime createdAt;
}
