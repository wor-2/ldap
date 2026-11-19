package com.admanager.config;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.List;
@Component
@Slf4j
public class JwtTokenProvider {
    @Value("${jwt.secret}") private String jwtSecret;
    @Value("${jwt.expiration-ms}") private long jwtExpirationMs;
    private SecretKey getSigningKey() {
        byte[] keyBytes = Base64.getDecoder().decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    public String generateToken(String username, List<String> roles) {
        return Jwts.builder().subject(username).claim("roles", roles)
                .issuedAt(new Date()).expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey()).compact();
    }
    public String getUsernameFromToken(String token) { return getClaims(token).getSubject(); }
    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) { return (List<String>) getClaims(token).get("roles"); }
    public boolean validateToken(String token) {
        try { getClaims(token); return true; } catch (Exception e) { log.warn("JWT invalid: {}", e.getMessage()); return false; }
    }
    private Claims getClaims(String token) {
        return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
    }
}
