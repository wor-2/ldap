package com.admanager.dto;
import lombok.*;
import java.util.List;
@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class LdapUserDto {
    private String dn;
    private String uid;
    private String cn;
    private String sn;
    private String givenName;
    private String mail;
    private String telephoneNumber;
    private List<String> memberOf;
    private List<String> appPermissions;
}
