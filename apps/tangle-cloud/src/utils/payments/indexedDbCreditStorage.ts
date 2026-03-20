import { openDb, STORES } from './db';
import { encryptData, decryptData } from './keyEncryption';

// Public metadata — always readable without decryption
export interface StoredCreditKeys {
  commitment: string;
  spendingPrivateKey: string;
  spendingPublicKey: string;
  salt: string;
  label?: string;
  createdAt: number;
}

// On-disk format: private key encrypted, rest in clear
interface EncryptedCreditRecord {
  commitment: string;
  encryptedPrivateKey: string; // AES-GCM encrypted
  spendingPublicKey: string;
  salt: string;
  label?: string;
  createdAt: number;
}

export const saveCreditKeys = async (
  keys: StoredCreditKeys,
  encryptionKey?: string,
): Promise<void> => {
  const db = await openDb();

  const record: EncryptedCreditRecord = {
    commitment: keys.commitment,
    encryptedPrivateKey: encryptionKey
      ? await encryptData(keys.spendingPrivateKey, encryptionKey)
      : keys.spendingPrivateKey, // Fallback: plaintext if no key (pre-unlock)
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

export const loadAllCreditKeys = async (
  encryptionKey?: string,
): Promise<StoredCreditKeys[]> => {
  const db = await openDb();
  const records: EncryptedCreditRecord[] = await new Promise(
    (resolve, reject) => {
      const tx = db.transaction(STORES.CREDIT_KEYS, 'readonly');
      const store = tx.objectStore(STORES.CREDIT_KEYS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result ?? []);
      request.onerror = () => reject(request.error);
    },
  );

  const results: StoredCreditKeys[] = [];
  for (const record of records) {
    let privateKey = '';
    if (encryptionKey) {
      try {
        privateKey = await decryptData(
          record.encryptedPrivateKey,
          encryptionKey,
        );
      } catch {
        // Can't decrypt — either wrong key or stored in plaintext
        privateKey = record.encryptedPrivateKey;
      }
    }

    results.push({
      commitment: record.commitment,
      spendingPrivateKey: privateKey,
      spendingPublicKey: record.spendingPublicKey,
      salt: record.salt,
      label: record.label,
      createdAt: record.createdAt,
    });
  }

  return results;
};

export const deleteCreditKeys = async (commitment: string): Promise<void> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CREDIT_KEYS, 'readwrite');
    const store = tx.objectStore(STORES.CREDIT_KEYS);
    const request = store.delete(commitment);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
