package com.example.demo.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecoveryCodeService {
  private static final SecureRandom RANDOM = new SecureRandom();
  private static final char[] ALPHABET =
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".toCharArray();
  private static final int CODE_LENGTH = 10;
  private static final int CODE_COUNT = 8;

  private final UserAccountRepository userRepository;
  private final RecoveryCodeRepository recoveryCodeRepository;

  public RecoveryCodeService(
      UserAccountRepository userRepository,
      RecoveryCodeRepository recoveryCodeRepository
  ) {
    this.userRepository = userRepository;
    this.recoveryCodeRepository = recoveryCodeRepository;
  }

  @Transactional
  public List<String> generateCodes(Long userId) {
    UserAccount user = userRepository.findById(userId)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));

    byte[] salt = ensureSalt(user);
    recoveryCodeRepository.deleteByUserId(userId);

    List<String> codes = new ArrayList<>(CODE_COUNT);
    for (int i = 0; i < CODE_COUNT; i++) {
      String code = generateCode();
      String hash = hashCode(salt, normalizeCode(code));
      recoveryCodeRepository.save(new RecoveryCode(user, hash));
      codes.add(code);
    }
    return codes;
  }

  @Transactional
  public Optional<UserAccount> consumeCode(String username, String code) {
    if (username == null || username.isBlank() || code == null || code.isBlank()) {
      return Optional.empty();
    }
    Optional<UserAccount> userMaybe = userRepository.findByUsername(username);
    if (userMaybe.isEmpty()) {
      return Optional.empty();
    }
    UserAccount user = userMaybe.get();
    if (user.getRecoverySalt() == null || user.getRecoverySalt().length == 0) {
      return Optional.empty();
    }

    String hash = hashCode(user.getRecoverySalt(), normalizeCode(code));
    Optional<RecoveryCode> record =
        recoveryCodeRepository.findByUser_IdAndCodeHashAndUsedFalse(user.getId(), hash);
    if (record.isEmpty()) {
      return Optional.empty();
    }
    RecoveryCode recoveryCode = record.get();
    recoveryCode.setUsed(true);
    recoveryCodeRepository.save(recoveryCode);
    return Optional.of(user);
  }

  private byte[] ensureSalt(UserAccount user) {
    byte[] salt = user.getRecoverySalt();
    if (salt == null || salt.length == 0) {
      salt = new byte[16];
      RANDOM.nextBytes(salt);
      user.setRecoverySalt(salt);
      userRepository.save(user);
    }
    return salt;
  }

  private String generateCode() {
    char[] buffer = new char[CODE_LENGTH + 1];
    for (int i = 0; i < CODE_LENGTH; i++) {
      buffer[i + (i >= 5 ? 1 : 0)] = ALPHABET[RANDOM.nextInt(ALPHABET.length)];
    }
    buffer[5] = '-';
    return new String(buffer);
  }

  private String normalizeCode(String code) {
    return code.replaceAll("[\\s-]", "").toUpperCase();
  }

  private String hashCode(byte[] salt, String code) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      digest.update(salt);
      digest.update((byte) ':');
      digest.update(code.getBytes(StandardCharsets.UTF_8));
      return Base64.getUrlEncoder().withoutPadding().encodeToString(digest.digest());
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException("SHA-256 not available", e);
    }
  }
}
