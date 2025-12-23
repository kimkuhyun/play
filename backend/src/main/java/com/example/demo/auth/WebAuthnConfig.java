package com.example.demo.auth;

import com.yubico.webauthn.CredentialRepository;
import com.yubico.webauthn.RelyingParty;
import com.yubico.webauthn.data.AttestationConveyancePreference;
import com.yubico.webauthn.data.RelyingPartyIdentity;
import java.util.HashSet;
import java.util.Optional;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(WebAuthnProperties.class)
public class WebAuthnConfig {

  @Bean
  public RelyingParty relyingParty(
      CredentialRepository credentialRepository,
      WebAuthnProperties properties
  ) {
    RelyingPartyIdentity identity = RelyingPartyIdentity.builder()
        .id(properties.rpId())
        .name(properties.rpName())
        .build();

    return RelyingParty.builder()
        .identity(identity)
        .credentialRepository(credentialRepository)
        .origins(new HashSet<>(properties.origins()))
        .allowOriginPort(properties.allowOriginPort())
        .allowOriginSubdomain(properties.allowOriginSubdomain())
        .attestationConveyancePreference(Optional.of(AttestationConveyancePreference.NONE))
        .validateSignatureCounter(true)
        .build();
  }
}
