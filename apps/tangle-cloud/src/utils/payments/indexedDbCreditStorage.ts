import { openDb, STORES } from './db';
import { encryptData, decryptData } from './keyEncryption';

export interface StoredCreditKeys {
  commitment: string;
  spendingPrivateKey: string;
  spendingPublicKey: string;
  salt: string;
  label?: string;
  createdAt: number;
}

interface EncryptedCreditRecord {
  commitment: string;
  owner: string; // wallet address — scoping key
  encryptedPrivateKey: string;
  spendingPublicKey: string;
  salt: string;
  label?: string;
  createdAt: number;
}

export const saveCreditKeys = async (
  keys: StoredCreditKeys,
  ownerAddress: string,
  encryptionKey?: string,
): Promise<void> => {
  const db = await openDb();

  const record: EncryptedCreditRecord = {
    commitment: keys.commitment,
    owner: ownerAddress.toLowerCase(),
    encryptedPrivateKey: encryptionKey
      ? await encryptData(keys.spendingPrivateKey, encryptionKey)
      : '', // No encryption key = don't store private key at all
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

  // Filter to this wallet's records only
  const owner = ownerAddress.toLowerCase();
  const records = allRecords.filter((r) => r.owner === owner);

  const results: StoredCreditKeys[] = [];
  for (const record of records) {
    let privateKey = '';
    if (encryptionKey && record.encryptedPrivateKey) {
      try {
        privateKey = await decryptData(
          record.encryptedPrivateKey,
          encryptionKey,
        );
      } catch {
        // Decryption failed — leave private key empty, don't expose ciphertext
        privateKey = '';
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
