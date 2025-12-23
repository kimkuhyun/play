export type CredentialDescriptorJSON = Omit<PublicKeyCredentialDescriptor, 'id'> & { id: string };

export type CreationOptionsJSON = Omit<
  PublicKeyCredentialCreationOptions,
  'challenge' | 'user' | 'excludeCredentials'
> & {
  challenge: string;
  user: Omit<PublicKeyCredentialUserEntity, 'id'> & { id: string };
  excludeCredentials?: CredentialDescriptorJSON[];
};

export type RequestOptionsJSON = Omit<
  PublicKeyCredentialRequestOptions,
  'challenge' | 'allowCredentials'
> & {
  challenge: string;
  allowCredentials?: CredentialDescriptorJSON[];
};

export type RegistrationResponseJSON = {
  id: string;
  rawId: string;
  type: string;
  clientExtensionResults: AuthenticationExtensionsClientOutputs;
  response: {
    attestationObject: string;
    clientDataJSON: string;
    transports?: AuthenticatorTransport[];
  };
};

export type AssertionResponseJSON = {
  id: string;
  rawId: string;
  type: string;
  clientExtensionResults: AuthenticationExtensionsClientOutputs;
  response: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
    userHandle: string | null;
  };
};

const base64UrlToBuffer = (base64url: string): ArrayBuffer => {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

const bufferToBase64Url = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const prepareCreationOptions = (
  options: CreationOptionsJSON
): PublicKeyCredentialCreationOptions => ({
  ...options,
  challenge: base64UrlToBuffer(options.challenge),
  user: {
    ...options.user,
    id: base64UrlToBuffer(options.user.id),
  },
  excludeCredentials: (options.excludeCredentials || []).map((cred: any) => ({
    ...cred,
    id: base64UrlToBuffer(cred.id),
  })),
});

export const prepareRequestOptions = (
  options: RequestOptionsJSON
): PublicKeyCredentialRequestOptions => ({
  ...options,
  challenge: base64UrlToBuffer(options.challenge),
  allowCredentials: (options.allowCredentials || []).map((cred: any) => ({
    ...cred,
    id: base64UrlToBuffer(cred.id),
  })),
});

export const credentialToRegistrationJSON = (
  credential: PublicKeyCredential
): RegistrationResponseJSON => {
  const response = credential.response as AuthenticatorAttestationResponse;
  const transports =
    typeof response.getTransports === 'function' ? response.getTransports() : undefined;

  return {
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    type: credential.type,
    clientExtensionResults: credential.getClientExtensionResults(),
    response: {
      attestationObject: bufferToBase64Url(response.attestationObject),
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      transports,
    },
  };
};

export const credentialToAssertionJSON = (
  credential: PublicKeyCredential
): AssertionResponseJSON => {
  const response = credential.response as AuthenticatorAssertionResponse;

  return {
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    type: credential.type,
    clientExtensionResults: credential.getClientExtensionResults(),
    response: {
      authenticatorData: bufferToBase64Url(response.authenticatorData),
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      signature: bufferToBase64Url(response.signature),
      userHandle: response.userHandle ? bufferToBase64Url(response.userHandle) : null,
    },
  };
};
