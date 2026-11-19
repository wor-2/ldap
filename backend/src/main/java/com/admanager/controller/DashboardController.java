package com.admanager.controller;
import com.admanager.dto.*;
import com.admanager.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/dashboard") @RequiredArgsConstructor
public class DashboardController {
    private final LdapUserService userService;
    private final LdapGroupService groupService;
    private final PermissionService permissionService;
    private final AuditService auditService;
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> stats() throws Exception {
        return ResponseEntity.ok(ApiResponse.success(DashboardStatsDto.builder()
            .totalUsers(userService.countUsers()).totalGroups(groupService.countGroups())
            .totalPermissions(permissionService.countPermissions()).totalAuditEntries(auditService.count()).build()));
    }
}
