package com.admanager.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
@Data
public class CreateGroupRequest {
    @NotBlank(message="Group name is required")
    @Pattern(regexp="^[a-zA-Z0-9_-]+$", message="Only letters, numbers, underscores and hyphens allowed")
    private String groupName;
    private String description;
}
