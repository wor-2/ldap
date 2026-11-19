package com.admanager.dto;
import lombok.*;
@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class LoginResponse {
    private String token;
    private String username;
    private String role;
    private String displayName;
    private String email;
}
