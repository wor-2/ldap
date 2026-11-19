package com.admanager.service;
import com.admanager.config.JwtTokenProvider;
import com.admanager.dto.LoginRequest;
import com.admanager.dto.LoginResponse;
import com.admanager.model.AppUser;
import com.admanager.repository.AppUserRepository;
import com.unboundid.ldap.sdk.*;
import com.unboundid.util.ssl.SSLUtil;
import com.unboundid.util.ssl.TrustAllTrustManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.net.ssl.SSLSocketFactory;
import java.time.LocalDateTime;
import java.util.List;
@Service @RequiredArgsConstructor @Slf4j
public class AuthService {
    private final LDAPConnectionPool ldapConnectionPool;
    private final AppUserRepository appUserRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuditService auditService;
    @Value("${ldap.host}") private String ldapHost;
    @Value("${ldap.port}") private int ldapPort;
    @Value("${ldap.base-dn}") private String baseDn;
    public LoginResponse login(LoginRequest request) {
        String username = request.getUsername();
        try {
            LDAPConnection conn = ldapConnectionPool.getConnection();
            SearchResultEntry userEntry;
            try {
                userEntry = conn.searchForEntry(baseDn, SearchScope.SUB,
                    "(uid=" + Filter.encodeValue(username) + ")", "dn", "cn", "mail", "givenName");
            } finally { ldapConnectionPool.releaseConnection(conn); }
            if (userEntry == null) {
                auditService.log(username, "LOGIN", "USER", username, "User not found", "FAILURE");
                throw new RuntimeException("Invalid username or password");
            }
            String userDn = userEntry.getDN();
            try {
                SSLUtil sslUtil = new SSLUtil(new TrustAllTrustManager());
                SSLSocketFactory sf = sslUtil.createSSLSocketFactory();
                try (LDAPConnection authConn = new LDAPConnection(sf, ldapHost, ldapPort)) {
                    authConn.bind(userDn, request.getPassword());
                }
            } catch (LDAPException e) {
                auditService.log(username, "LOGIN", "USER", username, "Invalid credentials", "FAILURE");
                throw new RuntimeException("Invalid username or password");
            }
            AppUser appUser = appUserRepository.findByUsername(username).orElseGet(() ->
                AppUser.builder().username(username)
                    .role(username.equals("superuser") ? "SUPER_USER" : "USER")
                    .email(userEntry.getAttributeValue("mail"))
                    .displayName(userEntry.getAttributeValue("cn")).build());
            appUser.setLastLogin(LocalDateTime.now());
            if (appUser.getEmail() == null) appUser.setEmail(userEntry.getAttributeValue("mail"));
            if (appUser.getDisplayName() == null) appUser.setDisplayName(userEntry.getAttributeValue("cn"));
            appUserRepository.save(appUser);
            String token = jwtTokenProvider.generateToken(username, List.of(appUser.getRole()));
            auditService.log(username, "LOGIN", "USER", username, "Login successful", "SUCCESS");
            return LoginResponse.builder().token(token).username(username).role(appUser.getRole())
                .displayName(appUser.getDisplayName()).email(appUser.getEmail()).build();
        } catch (LDAPException e) {
            auditService.log(username, "LOGIN", "USER", username, "LDAP error: " + e.getMessage(), "FAILURE");
            throw new RuntimeException("LDAP connection error. Please try again.");
        }
    }
}
