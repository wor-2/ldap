package com.admanager.dto;
import lombok.*;
@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class DashboardStatsDto {
    private long totalUsers;
    private long totalGroups;
    private long totalPermissions;
    private long totalAuditEntries;
}
