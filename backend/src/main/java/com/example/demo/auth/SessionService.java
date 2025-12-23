package com.example.demo.auth;

import jakarta.servlet.http.HttpSession;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class SessionService {
  private static final String SESSION_USER_KEY = "auth.userId";

  public void signIn(HttpSession session, Long userId) {
    session.setAttribute(SESSION_USER_KEY, userId);
  }

  public Optional<Long> getUserId(HttpSession session) {
    Object value = session.getAttribute(SESSION_USER_KEY);
    if (value instanceof Long userId) {
      return Optional.of(userId);
    }
    return Optional.empty();
  }

  public void signOut(HttpSession session) {
    session.invalidate();
  }
}
