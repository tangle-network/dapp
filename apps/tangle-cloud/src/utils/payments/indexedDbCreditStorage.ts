import { openDb, STORES } from './db';
import { encryptData, decryptData } from './keyEncryption';

export interface StoredCreditKeys {
  commitment: string;
  spendingPrivateKey: string; // Empty if locked/undecryptable
  spendingPublicKey: string;
  salt: string;
  label?: string;
  createdAt: number;
  isLocked: boolean; // True if private key could not be decrypted
}

interface EncryptedCreditRecord {
  commitment: string;
  owner: string;
  encryptedPrivateKey: string;
  spendingPublicKey: string;
  salt: string;
  label?: string;
  createdAt: number;
}

export const saveCreditKeys = async (
  keys: StoredCreditKeys,
  ownerAddress: string,
  encryptionKey: string,
): Promise<void> => {
  if (!encryptionKey) {
    throw new Error(
      'Encryption key required to store credit keys. Unlock your shielded keypair first.',
    );
  }

  const db = await openDb();
  const record: EncryptedCreditRecord = {
    commitment: keys.commitment,
    owner: ownerAddress.toLowerCase(),
    encryptedPrivateKey: await encryptData(
      keys.spendingPrivateKey,
      encryptionKey,
    ),
    spendingPublicKey: keys.spendingPublicKey,
    salt: keys.salt,
    label: keys.label,
    createdAt: keys.createdAt,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CREDIT_KEYS, 'readwrite');
    const store = tx.objectStore(STORES.CREDIT_KEYS);
    const request = store.put(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const loadCreditKeysForAddress = async (
  ownerAddress: string,
  encryptionKey?: string,
): Promise<StoredCreditKeys[]> => {
  const db = await openDb();
  const allRecords: EncryptedCreditRecord[] = await new Promise(
    (resolve, reject) => {
      const tx = db.transaction(STORES.CREDIT_KEYS, 'readonly');
      const store = tx.objectStore(STORES.CREDIT_KEYS);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result ?? []);
      request.onerror = () => reject(request.error);
    },
  );

  const owner = ownerAddress.toLowerCase();
  const records = allRecords.filter((r) => r.owner === owner);

  const results: StoredCreditKeys[] = [];
  for (const record of records) {
    let privateKey = '';
    let isLocked = true;

    if (encryptionKey && record.encryptedPrivateKey) {
      try {
        privateKey = await decryptData(
          record.encryptedPrivateKey,
          encryptionKey,
        );
        isLocked = false;
      } catch {
        // Decryption failed — mark as locked, don't expose ciphertext
      }
    }

    results.push({
      commitment: record.commitment,
      spendingPrivateKey: privateKey,
      spendingPublicKey: record.spendingPublicKey,
      salt: record.salt,
      label: record.label,
      createdAt: record.createdAt,
      isLocked,
    });
  }

  return results;
};

// Delete only verifies the record belongs to the caller's address
export const deleteCreditKeys = async (
  commitment: string,
  ownerAddress: string,
): Promise<void> => {
  const db = await openDb();

  // Read-then-delete to verify ownership
  const record: EncryptedCreditRecord | undefined = await new Promise(
    (resolve, reject) => {
      const tx = db.transaction(STORES.CREDIT_KEYS, 'readonly');
      const store = tx.objectStore(STORES.CREDIT_KEYS);
      const request = store.get(commitment);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    },
  );

  if (!record || record.owner !== ownerAddress.toLowerCase()) {
    return; // Not found or not owned — no-op
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CREDIT_KEYS, 'readwrite');
    const store = tx.objectStore(STORES.CREDIT_KEYS);
    const request = store.delete(commitment);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
