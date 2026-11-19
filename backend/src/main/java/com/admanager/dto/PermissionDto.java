package com.admanager.dto;
import lombok.*;
import java.time.LocalDateTime;
@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class PermissionDto {
    private Long id;
    private String name;
    private String description;
    private String category;
    private LocalDateTime createdAt;
}
