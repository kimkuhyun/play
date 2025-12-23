package com.example.demo.auth;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.webauthn")
public record WebAuthnProperties(
    String rpId,
    String rpName,
    List<String> origins,
    boolean allowOriginPort,
    boolean allowOriginSubdomain
) {}
