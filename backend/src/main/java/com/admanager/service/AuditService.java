package com.admanager.service;
import com.admanager.model.AuditLog;
import com.admanager.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
@Service @RequiredArgsConstructor @Slf4j
public class AuditService {
    private final AuditLogRepository auditLogRepository;
    @Async
    public void log(String actor, String action, String targetType, String targetName, String details, String status) {
        try {
            auditLogRepository.save(AuditLog.builder().actor(actor).action(action).targetType(targetType).targetName(targetName).details(details).status(status).build());
        } catch (Exception e) { log.error("Failed to write audit log: {}", e.getMessage()); }
    }
    public Page<AuditLog> getAuditLogs(int page, int size, String search) {
        return auditLogRepository.searchAll(search == null || search.isBlank() ? null : search, PageRequest.of(page, size, Sort.by("timestamp").descending()));
    }
    public long count() { return auditLogRepository.count(); }
}
