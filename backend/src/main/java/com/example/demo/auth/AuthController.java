package com.example.demo.auth;

import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final WebAuthnService webAuthnService;
  private final SessionService sessionService;
  private final RecoveryCodeService recoveryCodeService;
  private final UserAccountRepository userRepository;

  public AuthController(
      WebAuthnService webAuthnService,
      SessionService sessionService,
      RecoveryCodeService recoveryCodeService,
      UserAccountRepository userRepository
  ) {
    this.webAuthnService = webAuthnService;
    this.sessionService = sessionService;
    this.recoveryCodeService = recoveryCodeService;
    this.userRepository = userRepository;
  }

  @PostMapping("/webauthn/register/options")
  public WebAuthnService.StartResponse startRegistration(
      @RequestBody StartRegistrationRequest request,
      HttpSession session
  ) {
    try {
      return webAuthnService.startRegistration(
          request.username(),
          request.displayName(),
          sessionService.getUserId(session)
      );
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage());
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
    }
  }

  @PostMapping("/webauthn/register/verify")
  public AuthUserResponse finishRegistration(
      @RequestBody FinishWebAuthnRequest request,
      HttpSession session
  ) {
    try {
      UserAccount user = webAuthnService.finishRegistration(
          request.requestId(),
          request.credential()
      );
      sessionService.signIn(session, user.getId());
      return AuthUserResponse.from(user);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
    }
  }

  @PostMapping("/webauthn/login/options")
  public WebAuthnService.StartResponse startAuthentication(
      @RequestBody StartAuthenticationRequest request
  ) {
    try {
      Optional<String> username =
          request.username() == null || request.username().isBlank()
              ? Optional.empty()
              : Optional.of(request.username());
      return webAuthnService.startAuthentication(username);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
    }
  }

  @PostMapping("/webauthn/login/verify")
  public AuthUserResponse finishAuthentication(
      @RequestBody FinishWebAuthnRequest request,
      HttpSession session
  ) {
    try {
      UserAccount user = webAuthnService.finishAuthentication(
          request.requestId(),
          request.credential()
      );
      sessionService.signIn(session, user.getId());
      return AuthUserResponse.from(user);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
    }
  }

  @PostMapping("/recovery/create")
  public RecoveryCodesResponse createRecoveryCodes(HttpSession session) {
    Long userId = sessionService.getUserId(session)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in"));
    List<String> codes = recoveryCodeService.generateCodes(userId);
    return new RecoveryCodesResponse(codes);
  }

  @PostMapping("/recovery/login")
  public AuthUserResponse loginWithRecoveryCode(
      @RequestBody RecoveryLoginRequest request,
      HttpSession session
  ) {
    return recoveryCodeService.consumeCode(request.username(), request.code())
        .map(user -> {
          sessionService.signIn(session, user.getId());
          return AuthUserResponse.from(user);
        })
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid code"));
  }

  @GetMapping("/me")
  public AuthUserResponse me(HttpSession session) {
    Long userId = sessionService.getUserId(session)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in"));
    UserAccount user = userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in"));
    return AuthUserResponse.from(user);
  }

  @PostMapping("/logout")
  public void logout(HttpSession session) {
    sessionService.signOut(session);
  }

  public record StartRegistrationRequest(String username, String displayName) {}

  public record StartAuthenticationRequest(String username) {}

  public record FinishWebAuthnRequest(String requestId, Object credential) {}

  public record RecoveryLoginRequest(String username, String code) {}

  public record RecoveryCodesResponse(List<String> codes) {}

  public record AuthUserResponse(Long id, String username, String displayName) {
    public static AuthUserResponse from(UserAccount user) {
      return new AuthUserResponse(user.getId(), user.getUsername(), user.getDisplayName());
    }
  }
}
