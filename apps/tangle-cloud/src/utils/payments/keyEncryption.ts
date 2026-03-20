// Encrypt/decrypt key material using AES-GCM with a key derived from
// the wallet signature via PBKDF2. Per-user random salt stored alongside ciphertext.

const IV_LENGTH = 12;
const SALT_LENGTH = 16;

const deriveEncryptionKey = async (
  walletSignature: string,
  salt: Uint8Array,
): Promise<CryptoKey> => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(walletSignature),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
};

// Output format: base64(salt[16] || iv[12] || ciphertext || tag[16])
export const encryptData = async (
  plaintext: string,
  walletSignature: string,
): Promise<string> => {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const key = await deriveEncryptionKey(walletSignature, salt);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext),
  );

  const combined = new Uint8Array(
    SALT_LENGTH + IV_LENGTH + encrypted.byteLength,
  );
  combined.set(salt);
  combined.set(iv, SALT_LENGTH);
  combined.set(new Uint8Array(encrypted), SALT_LENGTH + IV_LENGTH);
  return btoa(String.fromCharCode(...combined));
};

export const decryptData = async (
  ciphertext: string,
  walletSignature: string,
): Promise<string> => {
  const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH);

  const key = await deriveEncryptionKey(walletSignature, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted,
  );

  return new TextDecoder().decode(decrypted);
};
