package com.example.demo.auth;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
  Optional<UserAccount> findByUsername(String username);

  @Query("select u from UserAccount u where u.userHandle = :userHandle")
  Optional<UserAccount> findByUserHandle(@Param("userHandle") byte[] userHandle);
}
