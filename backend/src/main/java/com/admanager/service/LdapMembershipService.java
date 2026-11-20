package com.admanager.service;
import com.unboundid.ldap.sdk.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
@Service @RequiredArgsConstructor @Slf4j
public class LdapMembershipService {
    @Autowired(required = false)
    private LDAPConnectionPool ldapConnectionPool;

    private void requireLdap() {
        if (ldapConnectionPool == null)
            throw new RuntimeException("LDAP is not available. Set DEV_MODE=false and configure a real LDAP server.");
    }

    public void addUserToGroup(String groupDn, String userDn) throws LDAPException {
        requireLdap();
        LDAPConnection conn = ldapConnectionPool.getConnection();
        try { conn.modify(groupDn, new Modification(ModificationType.ADD, "member", userDn)); log.info("Added {} to {}", userDn, groupDn); }
        finally { ldapConnectionPool.releaseConnection(conn); }
    }
    public void removeUserFromGroup(String groupDn, String userDn) throws LDAPException {
        requireLdap();
        LDAPConnection conn = ldapConnectionPool.getConnection();
        try { conn.modify(groupDn, new Modification(ModificationType.DELETE, "member", userDn)); log.info("Removed {} from {}", userDn, groupDn); }
        finally { ldapConnectionPool.releaseConnection(conn); }
    }
    public List<String> getGroupMembers(String groupDn) throws LDAPException {
        requireLdap();
        LDAPConnection conn = ldapConnectionPool.getConnection();
        try {
            SearchResultEntry entry = conn.getEntry(groupDn, "member");
            if (entry == null) return Collections.emptyList();
            String[] members = entry.getAttributeValues("member");
            return members != null ? Arrays.asList(members) : Collections.emptyList();
        } finally { ldapConnectionPool.releaseConnection(conn); }
    }
}
