package com.admanager.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity @Table(name="permissions") @Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Permission {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(unique=true,nullable=false) private String name;
    @Column(length=500) private String description;
    @Column(nullable=false) @Builder.Default private String category = "CUSTOM";
    @Column(nullable=false,updatable=false) private LocalDateTime createdAt;
    @PrePersist protected void prePersist() { createdAt = LocalDateTime.now(); }
}
