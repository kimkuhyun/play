package com.example.demo.auth;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yubico.webauthn.AssertionRequest;
import com.yubico.webauthn.FinishAssertionOptions;
import com.yubico.webauthn.FinishRegistrationOptions;
import com.yubico.webauthn.RelyingParty;
import com.yubico.webauthn.StartAssertionOptions;
import com.yubico.webauthn.StartRegistrationOptions;
import com.yubico.webauthn.data.AuthenticatorSelectionCriteria;
import com.yubico.webauthn.data.ByteArray;
import com.yubico.webauthn.data.PublicKeyCredential;
import com.yubico.webauthn.data.PublicKeyCredentialCreationOptions;
import com.yubico.webauthn.data.ResidentKeyRequirement;
import com.yubico.webauthn.data.UserIdentity;
import com.yubico.webauthn.data.UserVerificationRequirement;
import com.yubico.webauthn.exception.AssertionFailedException;
import com.yubico.webauthn.exception.RegistrationFailedException;
import java.security.SecureRandom;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WebAuthnService {
  private static final SecureRandom RANDOM = new SecureRandom();

  private final RelyingParty relyingParty;
  private final WebAuthnRequestStore requestStore;
  private final UserAccountRepository userRepository;
  private final WebAuthnCredentialRepository credentialRepository;
  private final ObjectMapper objectMapper;

  public WebAuthnService(
      RelyingParty relyingParty,
      WebAuthnRequestStore requestStore,
      UserAccountRepository userRepository,
      WebAuthnCredentialRepository credentialRepository,
      ObjectMapper objectMapper
  ) {
    this.relyingParty = relyingParty;
    this.requestStore = requestStore;
    this.userRepository = userRepository;
    this.credentialRepository = credentialRepository;
    this.objectMapper = objectMapper;
  }

  @Transactional
  public StartResponse startRegistration(
      String username,
      String displayName,
      Optional<Long> sessionUserId
  ) {
    if (username == null || username.isBlank()) {
      throw new IllegalArgumentException("Username is required");
    }
    String finalDisplayName = (displayName == null || displayName.isBlank())
        ? username
        : displayName;

    UserAccount user = userRepository.findByUsername(username).orElse(null);
    if (user != null) {
      if (sessionUserId.isEmpty() || !user.getId().equals(sessionUserId.get())) {
        throw new IllegalStateException("User already exists");
      }
    } else {
      user = new UserAccount(username, finalDisplayName, randomBytes(32));
      userRepository.save(user);
    }

    UserIdentity userIdentity = UserIdentity.builder()
        .name(user.getUsername())
        .displayName(user.getDisplayName())
        .id(new ByteArray(user.getUserHandle()))
        .build();

    AuthenticatorSelectionCriteria selection = AuthenticatorSelectionCriteria.builder()
        .residentKey(ResidentKeyRequirement.REQUIRED)
        .userVerification(UserVerificationRequirement.REQUIRED)
        .build();

    PublicKeyCredentialCreationOptions options = relyingParty.startRegistration(
        StartRegistrationOptions.builder()
            .user(userIdentity)
            .authenticatorSelection(selection)
            .build()
    );

    WebAuthnRequestStore.PendingRegistration pending =
        requestStore.createRegistration(options, user.getId(), user.getUsername());

    try {
      return new StartResponse(pending.requestId(), options.toCredentialsCreateJson());
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("Failed to serialize registration options", e);
    }
  }

  @Transactional
  public UserAccount finishRegistration(String requestId, Object credentialPayload) {
    WebAuthnRequestStore.PendingRegistration pending = requestStore
        .consumeRegistration(requestId)
        .orElseThrow(() -> new IllegalArgumentException("Registration request expired"));

    PublicKeyCredential<
        com.yubico.webauthn.data.AuthenticatorAttestationResponse,
        com.yubico.webauthn.data.ClientRegistrationExtensionOutputs
        > credential = parseRegistrationCredential(credentialPayload);

    com.yubico.webauthn.RegistrationResult result;
    try {
      result = relyingParty.finishRegistration(
          FinishRegistrationOptions.builder()
              .request(pending.options())
              .response(credential)
              .build()
      );
    } catch (RegistrationFailedException e) {
      throw new IllegalArgumentException("Registration failed", e);
    }

    UserAccount user = userRepository.findById(pending.userId())
        .orElseThrow(() -> new IllegalStateException("User not found"));

    String transports = JpaCredentialRepository.Transports.join(
        result.getKeyId().getTransports().orElse(null)
    );

    WebAuthnCredential newCredential = new WebAuthnCredential(
        user,
        result.getKeyId().getId().getBytes(),
        result.getPublicKeyCose().getBytes(),
        result.getSignatureCount(),
        transports
    );
    newCredential.setBackupEligible(result.isBackupEligible());
    newCredential.setBackupState(result.isBackedUp());
    newCredential.setAaguid(result.getAaguid().getBytes());
    credentialRepository.save(newCredential);

    return user;
  }

  public StartResponse startAuthentication(Optional<String> username) {
    if (username.isPresent()) {
      String value = username.get();
      if (value.isBlank() || userRepository.findByUsername(value).isEmpty()) {
        throw new IllegalArgumentException("Unknown user");
      }
    }

    AssertionRequest request = relyingParty.startAssertion(
        StartAssertionOptions.builder()
            .username(username)
            .userVerification(UserVerificationRequirement.REQUIRED)
            .build()
    );

    WebAuthnRequestStore.PendingAssertion pending =
        requestStore.createAssertion(request, username);

    try {
      return new StartResponse(pending.requestId(), request.toCredentialsGetJson());
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("Failed to serialize assertion options", e);
    }
  }

  @Transactional
  public UserAccount finishAuthentication(String requestId, Object credentialPayload) {
    WebAuthnRequestStore.PendingAssertion pending = requestStore
        .consumeAssertion(requestId)
        .orElseThrow(() -> new IllegalArgumentException("Assertion request expired"));

    PublicKeyCredential<
        com.yubico.webauthn.data.AuthenticatorAssertionResponse,
        com.yubico.webauthn.data.ClientAssertionExtensionOutputs
        > credential = parseAssertionCredential(credentialPayload);

    com.yubico.webauthn.AssertionResult result;
    try {
      result = relyingParty.finishAssertion(
          FinishAssertionOptions.builder()
              .request(pending.request())
              .response(credential)
              .build()
      );
    } catch (AssertionFailedException e) {
      throw new IllegalArgumentException("Assertion failed", e);
    }

    if (!result.isSuccess()) {
      throw new IllegalArgumentException("Assertion failed");
    }

    UserAccount user = userRepository.findByUsername(result.getUsername())
        .orElseThrow(() -> new IllegalStateException("User not found"));

    credentialRepository.findByCredentialIdAndUserHandle(
            result.getCredential().getCredentialId().getBytes(),
            result.getCredential().getUserHandle().getBytes())
        .ifPresent(found -> {
          found.setSignatureCount(result.getSignatureCount());
          found.setBackupEligible(result.isBackupEligible());
          found.setBackupState(result.isBackedUp());
          credentialRepository.save(found);
        });

    return user;
  }

  private byte[] randomBytes(int size) {
    byte[] bytes = new byte[size];
    RANDOM.nextBytes(bytes);
    return bytes;
  }

  private PublicKeyCredential<
      com.yubico.webauthn.data.AuthenticatorAttestationResponse,
      com.yubico.webauthn.data.ClientRegistrationExtensionOutputs
      > parseRegistrationCredential(Object credentialPayload) {
    if (credentialPayload == null) {
      throw new IllegalArgumentException("Missing attestation response");
    }
    try {
      String json = objectMapper.writeValueAsString(credentialPayload);
      return PublicKeyCredential.parseRegistrationResponseJson(json);
    } catch (Exception e) {
      throw new IllegalArgumentException("Invalid attestation response", e);
    }
  }

  private PublicKeyCredential<
      com.yubico.webauthn.data.AuthenticatorAssertionResponse,
      com.yubico.webauthn.data.ClientAssertionExtensionOutputs
      > parseAssertionCredential(Object credentialPayload) {
    if (credentialPayload == null) {
      throw new IllegalArgumentException("Missing assertion response");
    }
    try {
      String json = objectMapper.writeValueAsString(credentialPayload);
      return PublicKeyCredential.parseAssertionResponseJson(json);
    } catch (Exception e) {
      throw new IllegalArgumentException("Invalid assertion response", e);
    }
  }

  public record StartResponse(String requestId, String publicKey) {}
}
