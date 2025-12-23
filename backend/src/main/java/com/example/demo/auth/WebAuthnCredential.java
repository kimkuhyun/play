package com.example.demo.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(
    name = "webauthn_credentials",
    uniqueConstraints = @UniqueConstraint(name = "uq_credential_id", columnNames = "credential_id")
)
public class WebAuthnCredential {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UserAccount user;

  @JdbcTypeCode(SqlTypes.VARBINARY)
  @Column(name = "credential_id", nullable = false, columnDefinition = "bytea")
  private byte[] credentialId;

  @JdbcTypeCode(SqlTypes.VARBINARY)
  @Column(name = "public_key_cose", nullable = false, columnDefinition = "bytea")
  private byte[] publicKeyCose;

  @Column(name = "signature_count", nullable = false)
  private long signatureCount;

  @Column(name = "transports")
  private String transports;

  @Column(name = "backup_eligible")
  private Boolean backupEligible;

  @Column(name = "backup_state")
  private Boolean backupState;

  @JdbcTypeCode(SqlTypes.VARBINARY)
  @Column(name = "aaguid", columnDefinition = "bytea")
  private byte[] aaguid;

  protected WebAuthnCredential() {}

  public WebAuthnCredential(
      UserAccount user,
      byte[] credentialId,
      byte[] publicKeyCose,
      long signatureCount,
      String transports
  ) {
    this.user = user;
    this.credentialId = credentialId;
    this.publicKeyCose = publicKeyCose;
    this.signatureCount = signatureCount;
    this.transports = transports;
  }

  public Long getId() {
    return id;
  }

  public UserAccount getUser() {
    return user;
  }

  public void setUser(UserAccount user) {
    this.user = user;
  }

  public byte[] getCredentialId() {
    return credentialId;
  }

  public void setCredentialId(byte[] credentialId) {
    this.credentialId = credentialId;
  }

  public byte[] getPublicKeyCose() {
    return publicKeyCose;
  }

  public void setPublicKeyCose(byte[] publicKeyCose) {
    this.publicKeyCose = publicKeyCose;
  }

  public long getSignatureCount() {
    return signatureCount;
  }

  public void setSignatureCount(long signatureCount) {
    this.signatureCount = signatureCount;
  }

  public String getTransports() {
    return transports;
  }

  public void setTransports(String transports) {
    this.transports = transports;
  }

  public Boolean getBackupEligible() {
    return backupEligible;
  }

  public void setBackupEligible(Boolean backupEligible) {
    this.backupEligible = backupEligible;
  }

  public Boolean getBackupState() {
    return backupState;
  }

  public void setBackupState(Boolean backupState) {
    this.backupState = backupState;
  }

  public byte[] getAaguid() {
    return aaguid;
  }

  public void setAaguid(byte[] aaguid) {
    this.aaguid = aaguid;
  }
}
