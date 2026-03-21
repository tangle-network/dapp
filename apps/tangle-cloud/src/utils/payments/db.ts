// Shared IndexedDB instance for all storage.
// Single source of truth for schema upgrades.

const DB_NAME = 'tangle-private-cloud';
const DB_VERSION = 1;

const STORES = {
  NOTES: 'shielded-notes',
  CREDIT_KEYS: 'credit-keys',
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

export const openDb = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.NOTES)) {
        db.createObjectStore(STORES.NOTES);
      }
      if (!db.objectStoreNames.contains(STORES.CREDIT_KEYS)) {
        db.createObjectStore(STORES.CREDIT_KEYS, { keyPath: 'commitment' });
      }
    };

    request.onblocked = () => {
      dbPromise = null;
      reject(new Error('IndexedDB blocked — close other tabs using this app'));
    };

    request.onsuccess = () => {
      const db = request.result;

      // Invalidate cache if connection closes unexpectedly
      db.onclose = () => {
        dbPromise = null;
      };

      // Handle schema upgrade from another tab
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };

      resolve(db);
    };

    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
};

export { STORES };
