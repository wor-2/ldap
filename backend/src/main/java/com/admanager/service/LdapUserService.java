package com.admanager.service;
import com.admanager.dto.CreateUserRequest;
import com.admanager.dto.LdapUserDto;
import com.admanager.repository.UserPermissionRepository;
import com.unboundid.ldap.sdk.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;
@Service @RequiredArgsConstructor @Slf4j
public class LdapUserService {
    private final LDAPConnectionPool ldapConnectionPool;
    private final UserPermissionRepository userPermissionRepository;
    @Value("${ldap.base-dn}") private String baseDn;
    @Value("${ldap.users-ou}") private String usersOu;
    @Value("${ldap.superusers-ou}") private String superUsersOu;
    public List<LdapUserDto> listAllUsers() throws LDAPException {
        LDAPConnection conn = ldapConnectionPool.getConnection();
        try {
            List<LdapUserDto> results = new ArrayList<>();
            for (String ou : new String[]{usersOu, superUsersOu}) {
                conn.search(ou, SearchScope.ONE, "(objectClass=inetOrgPerson)", "uid","cn","sn","givenName","mail","telephoneNumber")
                    .getSearchEntries().stream().map(e -> toDto(e)).forEach(results::add);
            }
            return results;
        } finally { ldapConnectionPool.releaseConnection(conn); }
    }
    public List<LdapUserDto> searchUsers(String query) throws LDAPException {
        LDAPConnection conn = ldapConnectionPool.getConnection();
        try {
            String safe = Filter.encodeValue(query);
            return conn.search(baseDn, SearchScope.SUB,
                "(&(objectClass=inetOrgPerson)(|(uid=*"+safe+"*)(cn=*"+safe+"*)(mail=*"+safe+"*)))",
                "uid","cn","sn","givenName","mail","telephoneNumber")
                .getSearchEntries().stream().map(e -> toDto(e)).collect(Collectors.toList());
        } finally { ldapConnectionPool.releaseConnection(conn); }
    }
    public LdapUserDto getUserDetails(String username) throws LDAPException {
        LDAPConnection conn = ldapConnectionPool.getConnection();
        try {
            SearchResultEntry entry = conn.searchForEntry(baseDn, SearchScope.SUB,
                "(uid="+Filter.encodeValue(username)+")", "uid","cn","sn","givenName","mail","telephoneNumber");
            if (entry == null) throw new LDAPException(ResultCode.NO_SUCH_OBJECT, "User not found: " + username);
            LdapUserDto dto = toDto(entry);
            List<String> groups = conn.search(baseDn, SearchScope.SUB, "(member="+entry.getDN()+")", "cn")
                .getSearchEntries().stream().map(e -> e.getAttributeValue("cn")).filter(Objects::nonNull).collect(Collectors.toList());
            dto.setMemberOf(groups);
            List<String> perms = userPermissionRepository.findByUsernameAndActiveTrue(username).stream()
                .map(up -> up.getPermission().getName()).collect(Collectors.toList());
            dto.setAppPermissions(perms);
            return dto;
        } finally { ldapConnectionPool.releaseConnection(conn); }
    }
    public LdapUserDto createUser(CreateUserRequest request, String createdBy) throws LDAPException {
        String userDn = "uid=" + request.getUid() + "," + usersOu;
        List<Attribute> attrs = new ArrayList<>();
        attrs.add(new Attribute("objectClass", "top", "person", "organizationalPerson", "inetOrgPerson"));
        attrs.add(new Attribute("uid", request.getUid()));
        attrs.add(new Attribute("cn", request.getGivenName() + " " + request.getSn()));
        attrs.add(new Attribute("sn", request.getSn()));
        attrs.add(new Attribute("givenName", request.getGivenName()));
        attrs.add(new Attribute("mail", request.getMail()));
        attrs.add(new Attribute("userPassword", request.getPassword()));
        if (request.getTelephoneNumber() != null && !request.getTelephoneNumber().isBlank()) attrs.add(new Attribute("telephoneNumber", request.getTelephoneNumber()));
        if (request.getDepartment() != null && !request.getDepartment().isBlank()) attrs.add(new Attribute("departmentNumber", request.getDepartment()));
        if (request.getTitle() != null && !request.getTitle().isBlank()) attrs.add(new Attribute("title", request.getTitle()));
        LDAPConnection conn = ldapConnectionPool.getConnection();
        try {
            conn.add(new AddRequest(userDn, attrs));
            log.info("Created user: {} by {}", userDn, createdBy);
            return LdapUserDto.builder().dn(userDn).uid(request.getUid()).cn(request.getGivenName()+" "+request.getSn())
                .sn(request.getSn()).givenName(request.getGivenName()).mail(request.getMail())
                .telephoneNumber(request.getTelephoneNumber()).memberOf(Collections.emptyList()).appPermissions(Collections.emptyList()).build();
        } finally { ldapConnectionPool.releaseConnection(conn); }
    }
    public long countUsers() throws LDAPException {
        LDAPConnection conn = ldapConnectionPool.getConnection();
        try {
            return conn.search(baseDn, SearchScope.SUB, "(objectClass=inetOrgPerson)", "uid").getEntryCount();
        } finally { ldapConnectionPool.releaseConnection(conn); }
    }
    private LdapUserDto toDto(SearchResultEntry e) {
        return LdapUserDto.builder().dn(e.getDN()).uid(e.getAttributeValue("uid")).cn(e.getAttributeValue("cn"))
            .sn(e.getAttributeValue("sn")).givenName(e.getAttributeValue("givenName")).mail(e.getAttributeValue("mail"))
            .telephoneNumber(e.getAttributeValue("telephoneNumber")).memberOf(new ArrayList<>()).appPermissions(new ArrayList<>()).build();
    }
}
