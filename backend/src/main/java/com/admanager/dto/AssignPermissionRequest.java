package com.admanager.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class AssignPermissionRequest {
    @NotBlank(message="Username required") private String username;
    @NotNull(message="Permission ID required") private Long permissionId;
    private LocalDateTime expiresAt;
}
