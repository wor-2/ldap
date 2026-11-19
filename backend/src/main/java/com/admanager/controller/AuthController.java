package com.admanager.controller;
import com.admanager.dto.*;
import com.admanager.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Login successful", authService.login(request)));
    }
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String,String>>> me(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(Map.of("username", auth.getName())));
    }
}
