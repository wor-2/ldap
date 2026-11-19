package com.admanager.repository;
import com.admanager.model.UserPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
public interface UserPermissionRepository extends JpaRepository<UserPermission, Long> {
    List<UserPermission> findByUsernameAndActiveTrue(String username);
    List<UserPermission> findByUsername(String username);
    boolean existsByUsernameAndPermissionIdAndActiveTrue(String username, Long permissionId);
    @Modifying @Transactional
    void deleteByPermissionId(Long permissionId);
}
