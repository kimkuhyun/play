package com.example.demo.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class UserAccount {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String username;

  @Column(nullable = false)
  private String displayName;

  @JdbcTypeCode(SqlTypes.VARBINARY)
  @Column(nullable = false, columnDefinition = "bytea")
  private byte[] userHandle;

  @JdbcTypeCode(SqlTypes.VARBINARY)
  @Column(columnDefinition = "bytea")
  private byte[] recoverySalt;

  protected UserAccount() {}

  public UserAccount(String username, String displayName, byte[] userHandle) {
    this.username = username;
    this.displayName = displayName;
    this.userHandle = userHandle;
  }

  public Long getId() {
    return id;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getDisplayName() {
    return displayName;
  }

  public void setDisplayName(String displayName) {
    this.displayName = displayName;
  }

  public byte[] getUserHandle() {
    return userHandle;
  }

  public void setUserHandle(byte[] userHandle) {
    this.userHandle = userHandle;
  }

  public byte[] getRecoverySalt() {
    return recoverySalt;
  }

  public void setRecoverySalt(byte[] recoverySalt) {
    this.recoverySalt = recoverySalt;
  }
}
