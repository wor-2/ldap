package com.admanager.service;
import com.admanager.dto.CreateGroupRequest;
import com.admanager.dto.GroupDto;
import com.unboundid.ldap.sdk.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;
@Service @RequiredArgsConstructor @Slf4j
public class LdapGroupService {
    private final LDAPConnectionPool ldapConnectionPool;
    @Value("${ldap.base-dn}") private String baseDn;
    @Value("${ldap.groups-ou}") private String groupsOu;
    public List<GroupDto> listGroups() throws LDAPException {
        LDAPConnection conn = ldapConnectionPool.getConnection();
        try {
            SearchResult r = conn.search(groupsOu, SearchScope.ONE, "(objectClass=groupOfNames)", "cn", "description", "member");
            return r.getSearchEntries().stream().map(this::toDto).collect(Collectors.toList());
        } finally { ldapConnectionPool.releaseConnection(conn); }
    }
    public List<GroupDto> searchGroups(String query) throws LDAPException {
        LDAPConnection conn = ldapConnectionPool.getConnection();
        try {
            String safe = Filter.encodeValue(query);
            SearchResult r = conn.search(groupsOu, SearchScope.ONE, "(&(objectClass=groupOfNames)(cn=*"+safe+"*))", "cn", "description", "member");
            return r.getSearchEntries().stream().map(this::toDto).collect(Collectors.toList());
        } finally { ldapConnectionPool.releaseConnection(conn); }
    }
    public GroupDto createGroup(CreateGroupRequest request, String createdBy) throws LDAPException {
        String groupDn = "cn=" + request.getGroupName() + "," + groupsOu;
        LDAPConnection conn = ldapConnectionPool.getConnection();
        try {
            SearchResultEntry creatorEntry = conn.searchForEntry(baseDn, SearchScope.SUB, "(uid="+Filter.encodeValue(createdBy)+")", "dn");
            String adminDn = (creatorEntry != null) ? creatorEntry.getDN() : "cn=admin," + baseDn;
            List<Attribute> attrs = new ArrayList<>();
            attrs.add(new Attribute("objectClass", "top", "groupOfNames"));
            attrs.add(new Attribute("cn", request.getGroupName()));
            if (request.getDescription() != null && !request.getDescription().isBlank())
                attrs.add(new Attribute("description", request.getDescription()));
            attrs.add(new Attribute("member", adminDn));
            conn.add(new AddRequest(groupDn, attrs));
            log.info("Created group: {}", groupDn);
            return GroupDto.builder().dn(groupDn).cn(request.getGroupName()).description(request.getDescription()).memberCount(1).members(List.of(adminDn)).build();
        } finally { ldapConnectionPool.releaseConnection(conn); }
    }
    public GroupDto getGroup(String groupDn) throws LDAPException {
        LDAPConnection conn = ldapConnectionPool.getConnection();
        try {
            SearchResultEntry entry = conn.getEntry(groupDn, "cn", "description", "member");
            if (entry == null) throw new LDAPException(ResultCode.NO_SUCH_OBJECT, "Group not found: " + groupDn);
            return toDto(entry);
        } finally { ldapConnectionPool.releaseConnection(conn); }
    }
    public void deleteGroup(String groupDn) throws LDAPException {
        LDAPConnection conn = ldapConnectionPool.getConnection();
        try { conn.delete(groupDn); log.info("Deleted group: {}", groupDn); }
        finally { ldapConnectionPool.releaseConnection(conn); }
    }
    public long countGroups() throws LDAPException {
        LDAPConnection conn = ldapConnectionPool.getConnection();
        try {
            return conn.search(groupsOu, SearchScope.ONE, "(objectClass=groupOfNames)", "cn").getEntryCount();
        } finally { ldapConnectionPool.releaseConnection(conn); }
    }
    private GroupDto toDto(SearchResultEntry e) {
        String[] members = e.getAttributeValues("member");
        List<String> memberList = members != null ? Arrays.asList(members) : Collections.emptyList();
        return GroupDto.builder().dn(e.getDN()).cn(e.getAttributeValue("cn")).description(e.getAttributeValue("description")).memberCount(memberList.size()).members(memberList).build();
    }
}
