package com.admanager.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity @Table(name="app_users") @Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AppUser {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(unique=true,nullable=false) private String username;
    @Column(nullable=false) @Builder.Default private String role = "USER";
    @Column private String email;
    @Column private String displayName;
    @Column private LocalDateTime lastLogin;
    @Column(nullable=false,updatable=false) private LocalDateTime createdAt;
    @Column private String createdBy;
    @PrePersist protected void prePersist() { createdAt = LocalDateTime.now(); }
}
