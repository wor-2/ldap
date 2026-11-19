package com.admanager.controller;
import com.admanager.dto.*;
import com.admanager.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/groups") @RequiredArgsConstructor
public class GroupController {
    private final LdapGroupService groupService;
    private final LdapMembershipService membershipService;
    private final AuditService auditService;
    @GetMapping
    public ResponseEntity<ApiResponse<List<GroupDto>>> list(@RequestParam(required=false) String q) throws Exception {
        return ResponseEntity.ok(ApiResponse.success((q!=null&&!q.isBlank())?groupService.searchGroups(q):groupService.listGroups()));
    }
    @PostMapping
    public ResponseEntity<ApiResponse<GroupDto>> create(@Valid @RequestBody CreateGroupRequest req, Authentication auth) throws Exception {
        GroupDto group = groupService.createGroup(req, auth.getName());
        auditService.log(auth.getName(),"CREATE_GROUP","GROUP",req.getGroupName(),"Created group: "+req.getGroupName(),"SUCCESS");
        return ResponseEntity.ok(ApiResponse.success("Group created", group));
    }
    @GetMapping("/{groupDn}")
    public ResponseEntity<ApiResponse<GroupDto>> get(@PathVariable String groupDn) throws Exception {
        return ResponseEntity.ok(ApiResponse.success(groupService.getGroup(groupDn)));
    }
    @DeleteMapping("/{groupDn}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String groupDn, Authentication auth) throws Exception {
        groupService.deleteGroup(groupDn);
        auditService.log(auth.getName(),"DELETE_GROUP","GROUP",groupDn,"Deleted group","SUCCESS");
        return ResponseEntity.ok(ApiResponse.success("Group deleted", null));
    }
    @GetMapping("/{groupDn}/members")
    public ResponseEntity<ApiResponse<List<String>>> members(@PathVariable String groupDn) throws Exception {
        return ResponseEntity.ok(ApiResponse.success(membershipService.getGroupMembers(groupDn)));
    }
    @PostMapping("/{groupDn}/members")
    public ResponseEntity<ApiResponse<Void>> addMember(@PathVariable String groupDn, @Valid @RequestBody AddMemberRequest req, Authentication auth) throws Exception {
        membershipService.addUserToGroup(groupDn, req.getUserDn());
        auditService.log(auth.getName(),"ADD_MEMBER","GROUP",groupDn,"Added "+req.getUserDn(),"SUCCESS");
        return ResponseEntity.ok(ApiResponse.success("Member added", null));
    }
    @DeleteMapping("/{groupDn}/members")
    public ResponseEntity<ApiResponse<Void>> removeMember(@PathVariable String groupDn, @RequestParam String userDn, Authentication auth) throws Exception {
        membershipService.removeUserFromGroup(groupDn, userDn);
        auditService.log(auth.getName(),"REMOVE_MEMBER","GROUP",groupDn,"Removed "+userDn,"SUCCESS");
        return ResponseEntity.ok(ApiResponse.success("Member removed", null));
    }
}
