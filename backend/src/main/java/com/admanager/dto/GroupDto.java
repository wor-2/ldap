package com.admanager.dto;
import lombok.*;
import java.util.List;
@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class GroupDto {
    private String dn;
    private String cn;
    private String description;
    private int memberCount;
    private List<String> members;
}
