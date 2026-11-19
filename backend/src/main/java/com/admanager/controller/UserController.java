package com.admanager.controller;
import com.admanager.dto.*;
import com.admanager.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/users") @RequiredArgsConstructor
public class UserController {
    private final LdapUserService userService;
    private final AuditService auditService;
    @GetMapping
    public ResponseEntity<ApiResponse<List<LdapUserDto>>> list(@RequestParam(required=false) String q) throws Exception {
        return ResponseEntity.ok(ApiResponse.success((q!=null&&!q.isBlank())?userService.searchUsers(q):userService.listAllUsers()));
    }
    @GetMapping("/{username}")
    public ResponseEntity<ApiResponse<LdapUserDto>> get(@PathVariable String username) throws Exception {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserDetails(username)));
    }
    @PostMapping
    public ResponseEntity<ApiResponse<LdapUserDto>> create(@Valid @RequestBody CreateUserRequest req, Authentication auth) throws Exception {
        LdapUserDto user = userService.createUser(req, auth.getName());
        auditService.log(auth.getName(),"CREATE_USER","USER",req.getUid(),"Created user: "+req.getUid(),"SUCCESS");
        return ResponseEntity.ok(ApiResponse.success("User created", user));
    }
}
