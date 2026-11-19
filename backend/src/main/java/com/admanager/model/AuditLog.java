package com.admanager.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity @Table(name="audit_logs") @Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String actor;
    @Column(nullable=false) private String action;
    @Column private String targetType;
    @Column private String targetName;
    @Column(length=2000) private String details;
    @Column(nullable=false) @Builder.Default private String status = "SUCCESS";
    @Column(nullable=false,updatable=false) private LocalDateTime timestamp;
    @PrePersist protected void prePersist() { timestamp = LocalDateTime.now(); }
}
