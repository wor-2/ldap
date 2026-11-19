package com.admanager.controller;
import com.admanager.dto.ApiResponse;
import com.admanager.model.AuditLog;
import com.admanager.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/audit") @RequiredArgsConstructor
public class AuditController {
    private final AuditService auditService;
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAuditLogs(
        @RequestParam(defaultValue="0") int page,
        @RequestParam(defaultValue="20") int size,
        @RequestParam(required=false) String search) {
        return ResponseEntity.ok(ApiResponse.success(auditService.getAuditLogs(page, size, search)));
    }
}
