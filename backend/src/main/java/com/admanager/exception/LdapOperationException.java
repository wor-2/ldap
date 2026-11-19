package com.admanager.exception;
public class LdapOperationException extends RuntimeException {
    public LdapOperationException(String message) { super(message); }
    public LdapOperationException(String message, Throwable cause) { super(message, cause); }
}
