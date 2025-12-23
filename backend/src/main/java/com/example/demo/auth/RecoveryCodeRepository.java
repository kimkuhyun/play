package com.example.demo.auth;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RecoveryCodeRepository extends JpaRepository<RecoveryCode, Long> {
  @Modifying
  @Query("delete from RecoveryCode rc where rc.user.id = :userId")
  void deleteByUserId(@Param("userId") Long userId);

  Optional<RecoveryCode> findByUser_IdAndCodeHashAndUsedFalse(Long userId, String codeHash);
}
