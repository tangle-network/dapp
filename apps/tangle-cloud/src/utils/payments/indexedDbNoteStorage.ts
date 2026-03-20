import { openDb, STORES } from './db';

interface NoteStorage {
  load(): Promise<string[]>;
  save(notes: string[]): Promise<void>;
}

// Per-address note storage to prevent cross-wallet note leakage
export class IndexedDbNoteStorage implements NoteStorage {
  private readonly storageKey: string;

  constructor(address?: string) {
    this.storageKey = address
      ? `notes:${address.toLowerCase()}`
      : 'notes:anonymous';
  }

  async load(): Promise<string[]> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.NOTES, 'readonly');
      const store = tx.objectStore(STORES.NOTES);
      const request = store.get(this.storageKey);

      request.onsuccess = () => {
        resolve(Array.isArray(request.result) ? request.result : []);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async save(notes: string[]): Promise<void> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.NOTES, 'readwrite');
      const store = tx.objectStore(STORES.NOTES);
      const request = store.put(notes, this.storageKey);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
