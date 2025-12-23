package com.example.demo.auth;

import com.yubico.webauthn.AssertionRequest;
import com.yubico.webauthn.data.PublicKeyCredentialCreationOptions;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
public class WebAuthnRequestStore {
  private static final SecureRandom RANDOM = new SecureRandom();
  private static final Duration DEFAULT_TTL = Duration.ofMinutes(10);

  private final Clock clock = Clock.systemUTC();
  private final Map<String, PendingRegistration> registrations = new ConcurrentHashMap<>();
  private final Map<String, PendingAssertion> assertions = new ConcurrentHashMap<>();

  public PendingRegistration createRegistration(
      PublicKeyCredentialCreationOptions options,
      Long userId,
      String username
  ) {
    PendingRegistration pending = new PendingRegistration(
        randomId(),
        options,
        userId,
        username,
        expiresAt()
    );
    registrations.put(pending.requestId(), pending);
    return pending;
  }

  public PendingAssertion createAssertion(
      AssertionRequest request,
      Optional<String> username
  ) {
    PendingAssertion pending = new PendingAssertion(
        randomId(),
        request,
        username,
        expiresAt()
    );
    assertions.put(pending.requestId(), pending);
    return pending;
  }

  public Optional<PendingRegistration> consumeRegistration(String requestId) {
    return consume(registrations, requestId);
  }

  public Optional<PendingAssertion> consumeAssertion(String requestId) {
    return consume(assertions, requestId);
  }

  private Instant expiresAt() {
    return clock.instant().plus(DEFAULT_TTL);
  }

  private String randomId() {
    byte[] bytes = new byte[32];
    RANDOM.nextBytes(bytes);
    return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  private <T extends PendingRequest> Optional<T> consume(Map<String, T> store, String requestId) {
    if (requestId == null || requestId.isBlank()) {
      return Optional.empty();
    }
    T pending = store.remove(requestId);
    if (pending == null) {
      return Optional.empty();
    }
    if (pending.expiresAt().isBefore(clock.instant())) {
      return Optional.empty();
    }
    return Optional.of(pending);
  }

  interface PendingRequest {
    Instant expiresAt();
  }

  public record PendingRegistration(
      String requestId,
      PublicKeyCredentialCreationOptions options,
      Long userId,
      String username,
      Instant expiresAt
  ) implements PendingRequest {}

  public record PendingAssertion(
      String requestId,
      AssertionRequest request,
      Optional<String> username,
      Instant expiresAt
  ) implements PendingRequest {}
}
