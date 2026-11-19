package com.admanager.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data
public class AddMemberRequest {
    @NotBlank(message="User DN is required") private String userDn;
}
