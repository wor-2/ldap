package com.admanager.config;
import com.unboundid.ldap.sdk.*;
import com.unboundid.util.ssl.SSLUtil;
import com.unboundid.util.ssl.TrustAllTrustManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import javax.net.ssl.SSLSocketFactory;
@Configuration
@Slf4j
public class LdapConfig {
    @Value("${ldap.host}") private String ldapHost;
    @Value("${ldap.port}") private int ldapPort;
    @Value("${ldap.bind-dn}") private String bindDn;
    @Value("${ldap.bind-password}") private String bindPassword;
    @Value("${ldap.pool-min-size:2}") private int poolMinSize;
    @Value("${ldap.pool-max-size:10}") private int poolMaxSize;
    @Bean
    public LDAPConnectionPool ldapConnectionPool() throws Exception {
        SSLUtil sslUtil = new SSLUtil(new TrustAllTrustManager());
        SSLSocketFactory sslSocketFactory = sslUtil.createSSLSocketFactory();
        LDAPConnection seedConnection = new LDAPConnection(sslSocketFactory, ldapHost, ldapPort, bindDn, bindPassword);
        LDAPConnectionPool pool = new LDAPConnectionPool(seedConnection, poolMinSize, poolMaxSize);
        pool.setRetryFailedOperationsDueToInvalidConnections(true);
        pool.setMaxWaitTimeMillis(5000);
        log.info("LDAP connection pool initialized: ldaps://{}:{}", ldapHost, ldapPort);
        return pool;
    }
}
