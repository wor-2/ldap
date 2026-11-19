package com.admanager.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity @Table(name="user_permissions") @Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserPermission {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String username;
    @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="permission_id",nullable=false) private Permission permission;
    @Column(nullable=false) private String grantedBy;
    @Column(nullable=false,updatable=false) private LocalDateTime grantedAt;
    @Column private LocalDateTime expiresAt;
    @Column(nullable=false) @Builder.Default private boolean active = true;
    @PrePersist protected void prePersist() { grantedAt = LocalDateTime.now(); }
}
