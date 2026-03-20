import { openDb, STORES } from './db';

export interface StoredCreditKeys {
  commitment: string;
  spendingPrivateKey: string;
  spendingPublicKey: string;
  salt: string;
  label?: string;
  createdAt: number;
}

export const saveCreditKeys = async (keys: StoredCreditKeys): Promise<void> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CREDIT_KEYS, 'readwrite');
    const store = tx.objectStore(STORES.CREDIT_KEYS);
    const request = store.put(keys);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const loadAllCreditKeys = async (): Promise<StoredCreditKeys[]> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CREDIT_KEYS, 'readonly');
    const store = tx.objectStore(STORES.CREDIT_KEYS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result ?? []);
    request.onerror = () => reject(request.error);
  });
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
