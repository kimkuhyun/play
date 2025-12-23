package com.example.demo.auth;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WebAuthnCredentialRepository extends JpaRepository<WebAuthnCredential, Long> {
  List<WebAuthnCredential> findByUserId(Long userId);

  @Query("select c from WebAuthnCredential c join fetch c.user where c.credentialId = :credentialId")
  List<WebAuthnCredential> findAllByCredentialId(@Param("credentialId") byte[] credentialId);

  @Query("""
      select c from WebAuthnCredential c
      join c.user u
      where c.credentialId = :credentialId and u.userHandle = :userHandle
      """)
  Optional<WebAuthnCredential> findByCredentialIdAndUserHandle(
      @Param("credentialId") byte[] credentialId,
      @Param("userHandle") byte[] userHandle
  );
}
