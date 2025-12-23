package com.example.demo.auth;

import com.yubico.webauthn.CredentialRepository;
import com.yubico.webauthn.RegisteredCredential;
import com.yubico.webauthn.data.AuthenticatorTransport;
import com.yubico.webauthn.data.ByteArray;
import com.yubico.webauthn.data.PublicKeyCredentialDescriptor;
import com.yubico.webauthn.data.PublicKeyCredentialType;
import java.util.Collections;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class JpaCredentialRepository implements CredentialRepository {
  private final UserAccountRepository userAccountRepository;
  private final WebAuthnCredentialRepository credentialRepository;

  public JpaCredentialRepository(
      UserAccountRepository userAccountRepository,
      WebAuthnCredentialRepository credentialRepository
  ) {
    this.userAccountRepository = userAccountRepository;
    this.credentialRepository = credentialRepository;
  }

  @Override
  public Set<PublicKeyCredentialDescriptor> getCredentialIdsForUsername(String username) {
    return userAccountRepository.findByUsername(username)
        .map(user -> credentialRepository.findByUserId(user.getId()).stream()
            .map(this::toDescriptor)
            .collect(Collectors.toSet()))
        .orElseGet(Collections::emptySet);
  }

  @Override
  public Optional<ByteArray> getUserHandleForUsername(String username) {
    return userAccountRepository.findByUsername(username)
        .map(UserAccount::getUserHandle)
        .map(ByteArray::new);
  }

  @Override
  public Optional<String> getUsernameForUserHandle(ByteArray userHandle) {
    return userAccountRepository.findByUserHandle(userHandle.getBytes())
        .map(UserAccount::getUsername);
  }

  @Override
  public Optional<RegisteredCredential> lookup(ByteArray credentialId, ByteArray userHandle) {
    return credentialRepository.findByCredentialIdAndUserHandle(
            credentialId.getBytes(),
            userHandle.getBytes())
        .map(this::toRegisteredCredential);
  }

  @Override
  public Set<RegisteredCredential> lookupAll(ByteArray credentialId) {
    return credentialRepository.findAllByCredentialId(credentialId.getBytes()).stream()
        .map(this::toRegisteredCredential)
        .collect(Collectors.toSet());
  }

  private PublicKeyCredentialDescriptor toDescriptor(WebAuthnCredential credential) {
    return PublicKeyCredentialDescriptor.builder()
        .id(new ByteArray(credential.getCredentialId()))
        .type(PublicKeyCredentialType.PUBLIC_KEY)
        .transports(Transports.parse(credential.getTransports()))
        .build();
  }

  private RegisteredCredential toRegisteredCredential(WebAuthnCredential credential) {
    return RegisteredCredential.builder()
        .credentialId(new ByteArray(credential.getCredentialId()))
        .userHandle(new ByteArray(credential.getUser().getUserHandle()))
        .publicKeyCose(new ByteArray(credential.getPublicKeyCose()))
        .signatureCount(credential.getSignatureCount())
        .backupEligible(credential.getBackupEligible())
        .backupState(credential.getBackupState())
        .build();
  }

  static final class Transports {
    private Transports() {}

    static Set<AuthenticatorTransport> parse(String value) {
      if (value == null || value.isBlank()) {
        return Collections.emptySet();
      }
      return java.util.Arrays.stream(value.split(","))
          .map(String::trim)
          .filter(v -> !v.isEmpty())
          .map(AuthenticatorTransport::of)
          .collect(Collectors.toSet());
    }

    static String join(Set<AuthenticatorTransport> transports) {
      if (transports == null || transports.isEmpty()) {
        return null;
      }
      return transports.stream()
          .map(AuthenticatorTransport::getId)
          .sorted()
          .collect(Collectors.joining(","));
    }
  }
}
