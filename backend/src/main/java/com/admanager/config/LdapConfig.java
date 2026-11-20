package com.admanager.config;
import com.unboundid.ldap.sdk.*;
import com.unboundid.util.ssl.SSLUtil;
import com.unboundid.util.ssl.TrustAllTrustManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import javax.net.ssl.SSLSocketFactory;

@Configuration
@Slf4j
public class LdapConfig {
    @Value("${ldap.host:localhost}") private String ldapHost;
    @Value("${ldap.port:636}") private int ldapPort;
    @Value("${ldap.bind-dn:cn=admin,dc=admanager,dc=local}") private String bindDn;
    @Value("${ldap.bind-password:Admin@1234}") private String bindPassword;
    @Value("${ldap.pool-min-size:2}") private int poolMinSize;
    @Value("${ldap.pool-max-size:10}") private int poolMaxSize;

    /**
     * LDAP connection pool bean.
     * Only created when app.dev-mode=false (default).
     * When DEV_MODE=true env var is set, this bean is skipped and all
     * LDAP services operate in no-op / bypass mode.
     */
    @Bean
    @ConditionalOnProperty(name = "app.dev-mode", havingValue = "false", matchIfMissing = true)
    public LDAPConnectionPool ldapConnectionPool() throws Exception {
        try {
            SSLUtil sslUtil = new SSLUtil(new TrustAllTrustManager());
            SSLSocketFactory sslSocketFactory = sslUtil.createSSLSocketFactory();
            LDAPConnection seedConnection = new LDAPConnection(sslSocketFactory, ldapHost, ldapPort, bindDn, bindPassword);
            LDAPConnectionPool pool = new LDAPConnectionPool(seedConnection, poolMinSize, poolMaxSize);
            pool.setRetryFailedOperationsDueToInvalidConnections(true);
            pool.setMaxWaitTimeMillis(5000);
            log.info("LDAP connection pool initialized: ldaps://{}:{}", ldapHost, ldapPort);
            return pool;
        } catch (Exception e) {
            log.error("LDAP connection failed: {}. Set DEV_MODE=true to bypass LDAP.", e.getMessage());
            throw e;
        }
    }
}
