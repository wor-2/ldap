package com.admanager.service;
import com.admanager.dto.AssignPermissionRequest;
import com.admanager.dto.PermissionDto;
import com.admanager.model.Permission;
import com.admanager.model.UserPermission;
import com.admanager.repository.PermissionRepository;
import com.admanager.repository.UserPermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
@Service @RequiredArgsConstructor @Slf4j
public class PermissionService {
    private final PermissionRepository permissionRepository;
    private final UserPermissionRepository userPermissionRepository;
    public List<PermissionDto> listPermissions() {
        return permissionRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }
    public PermissionDto createPermission(PermissionDto dto) {
        if (permissionRepository.existsByName(dto.getName())) throw new RuntimeException("Permission '" + dto.getName() + "' already exists");
        return toDto(permissionRepository.save(Permission.builder().name(dto.getName()).description(dto.getDescription()).category(dto.getCategory() != null ? dto.getCategory() : "CUSTOM").build()));
    }
    public void deletePermission(Long id) { userPermissionRepository.deleteByPermissionId(id); permissionRepository.deleteById(id); }
    public UserPermission assignPermission(AssignPermissionRequest request, String grantedBy) {
        if (userPermissionRepository.existsByUsernameAndPermissionIdAndActiveTrue(request.getUsername(), request.getPermissionId()))
            throw new RuntimeException("Permission already assigned to this user");
        Permission perm = permissionRepository.findById(request.getPermissionId()).orElseThrow(() -> new RuntimeException("Permission not found"));
        return userPermissionRepository.save(UserPermission.builder().username(request.getUsername()).permission(perm).grantedBy(grantedBy).expiresAt(request.getExpiresAt()).active(true).build());
    }
    public void revokePermission(Long id) {
        UserPermission up = userPermissionRepository.findById(id).orElseThrow(() -> new RuntimeException("Assignment not found"));
        up.setActive(false); userPermissionRepository.save(up);
    }
    public List<UserPermission> getUserPermissions(String username) { return userPermissionRepository.findByUsernameAndActiveTrue(username); }
    public long countPermissions() { return permissionRepository.count(); }
    private PermissionDto toDto(Permission p) { return PermissionDto.builder().id(p.getId()).name(p.getName()).description(p.getDescription()).category(p.getCategory()).createdAt(p.getCreatedAt()).build(); }
}
