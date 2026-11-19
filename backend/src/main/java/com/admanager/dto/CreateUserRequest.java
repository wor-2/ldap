package com.admanager.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
@Data
public class CreateUserRequest {
    @NotBlank(message="Username required") @Pattern(regexp="^[a-z0-9._-]+$", message="Lowercase letters, numbers, dots, underscores, hyphens only") private String uid;
    @NotBlank(message="First name required") private String givenName;
    @NotBlank(message="Last name required") private String sn;
    @Email @NotBlank(message="Email required") private String mail;
    @NotBlank @Size(min=8, message="Password must be at least 8 characters") private String password;
    private String telephoneNumber;
    private String department;
    private String title;
}
