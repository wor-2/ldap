package com.admanager.repository;
import com.admanager.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    @Query("SELECT a FROM AuditLog a WHERE (:search IS NULL OR LOWER(a.actor) LIKE LOWER(CONCAT('%',:search,'%')) OR LOWER(a.targetName) LIKE LOWER(CONCAT('%',:search,'%')) OR LOWER(a.action) LIKE LOWER(CONCAT('%',:search,'%'))) ORDER BY a.timestamp DESC")
    Page<AuditLog> searchAll(@Param("search") String search, Pageable pageable);
}
