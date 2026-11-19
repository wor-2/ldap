package com.admanager.controller;
import com.admanager.dto.*;
import com.admanager.model.UserPermission;
import com.admanager.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/permissions") @RequiredArgsConstructor
public class PermissionController {
    private final PermissionService permissionService;
    private final AuditService auditService;
    @GetMapping public ResponseEntity<ApiResponse<List<PermissionDto>>> list() { return ResponseEntity.ok(ApiResponse.success(permissionService.listPermissions())); }
    @PostMapping public ResponseEntity<ApiResponse<PermissionDto>> create(@RequestBody PermissionDto dto, Authentication auth) {
        PermissionDto p = permissionService.createPermission(dto);
        auditService.log(auth.getName(),"CREATE_PERMISSION","PERMISSION",dto.getName(),"Created permission: "+dto.getName(),"SUCCESS");
        return ResponseEntity.ok(ApiResponse.success("Permission created", p));
    }
    @DeleteMapping("/{id}") public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id, Authentication auth) {
        permissionService.deletePermission(id);
        auditService.log(auth.getName(),"DELETE_PERMISSION","PERMISSION",id.toString(),"Deleted permission","SUCCESS");
        return ResponseEntity.ok(ApiResponse.success("Deleted", null));
    }
    @PostMapping("/assign") public ResponseEntity<ApiResponse<Void>> assign(@Valid @RequestBody AssignPermissionRequest req, Authentication auth) {
        permissionService.assignPermission(req, auth.getName());
        auditService.log(auth.getName(),"ASSIGN_PERMISSION","USER",req.getUsername(),"Assigned perm "+req.getPermissionId()+" to "+req.getUsername(),"SUCCESS");
        return ResponseEntity.ok(ApiResponse.success("Assigned", null));
    }
    @DeleteMapping("/assign/{id}") public ResponseEntity<ApiResponse<Void>> revoke(@PathVariable Long id, Authentication auth) {
        permissionService.revokePermission(id);
        auditService.log(auth.getName(),"REVOKE_PERMISSION","USER",id.toString(),"Revoked assignment","SUCCESS");
        return ResponseEntity.ok(ApiResponse.success("Revoked", null));
    }
    @GetMapping("/user/{username}") public ResponseEntity<ApiResponse<List<UserPermission>>> userPerms(@PathVariable String username) {
        return ResponseEntity.ok(ApiResponse.success(permissionService.getUserPermissions(username)));
    }
}
