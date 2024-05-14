'use client';

// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { Storage } from '@webb-tools/dapp-types';
import isBrowser from './isBrowser.js';

/**
 * The `BridgeStorage` is used to store the leaves of the merkle tree
 * of the underlying VAnchor contract. The key is the resource id
 */
export type BridgeStorage = {
  lastQueriedBlock: number;
  leaves: string[];
};

export const bridgeStorageFactory = (resourceId: string) => {
  return Storage.newFromCache<BridgeStorage>(resourceId, {
    async commit(key: string, data: BridgeStorage): Promise<void> {
      if (!isBrowser()) {
        return;
      }

      localStorage.setItem(key, JSON.stringify(data));
    },
    async fetch(key: string): Promise<BridgeStorage> {
      const defaultResult = {
        lastQueriedBlock: 0,
        leaves: [],
      } satisfies BridgeStorage as BridgeStorage;

      if (!isBrowser()) {
        return defaultResult;
      }

      const storageCached = localStorage.getItem(key);

      if (storageCached) {
        return {
          ...JSON.parse(storageCached),
        };
      }

      return defaultResult;
    },
  });
};

/**
 * The `KeyPairStorage` is used to store the keypair of the user.
 * The key is the wallet address of the user.
 * The value is the note account priv key of the user.
 */
export type MultipleKeyPairStorage = {
  /**
   * The key is the wallet address of the user.
   * The value is the note account priv key of the user.
   */
  [walletAddress: string]: string | null;
};

export const multipleKeypairStorageFactory = () =>
  Storage.newFromCache<MultipleKeyPairStorage>('keypairs', {
    async commit(key: string, data: MultipleKeyPairStorage): Promise<void> {
      if (!isBrowser()) {
        return;
      }

      localStorage.setItem(key, JSON.stringify(data));
    },
    async fetch(key: string): Promise<MultipleKeyPairStorage> {
      const defaultResult =
        {} satisfies MultipleKeyPairStorage as MultipleKeyPairStorage;
      if (!isBrowser()) {
        return defaultResult;
      }

      const storageCached = localStorage.getItem(key);

      if (storageCached) {
        return {
          ...JSON.parse(storageCached),
        };
      }

      return defaultResult;
    },
  });

/**
 * The `NoteStorage` is used to store the encrypted notes of the user.
 * The key is the resource id.
 * The value is the encrypted notes array.
 * @deprecated We will migrate to `MultiAccountNoteStorage` soon.
 */
type NoteStorage = Record<string, string[]>;

const NOTE_STORAGE_KEY = 'encryptedNotes';

/**
 * @deprecated Use `MultiAccountNoteStorage` instead.
 */
const resetNoteStorage = () => {
  localStorage.removeItem(NOTE_STORAGE_KEY);
};

/**
 * @deprecated Use `MultiAccountNoteStorage` instead.
 */
const noteStorageFactory = () => {
  return Storage.newFromCache<NoteStorage>(NOTE_STORAGE_KEY, {
    async commit(key: string, data: NoteStorage): Promise<void> {
      if (!isBrowser()) {
        return;
      }

      localStorage.setItem(key, JSON.stringify(data));
    },
    async fetch(key: string): Promise<NoteStorage> {
      const defaultResult = {} satisfies NoteStorage as NoteStorage;
      if (!isBrowser()) {
        return defaultResult;
      }

      const storageCached = localStorage.getItem(key);

      if (storageCached) {
        return {
          ...JSON.parse(storageCached),
        };
      }

      return defaultResult;
    },
  });
};

export const getV1NotesRecord = async () => {
  const noteStorage = await noteStorageFactory();
  const encryptedNotesRecord = await noteStorage.dump();

  // 32-bytes size resource id where each byte is represented by 2 characters
  const resourceIdSize = 32 * 2;

  // Only get the stored notes with the key is the resource id
  const encryptedNotesMap = Object.entries(encryptedNotesRecord).reduce(
    (acc, [resourceIdOrTypedChainId, notes]) => {
      // Only get the notes where the key if resource id
      if (
        resourceIdOrTypedChainId.replace('0x', '').length === resourceIdSize
      ) {
        acc[resourceIdOrTypedChainId] = notes;
      }

      return acc;
    },
    {} as Record<string, Array<string>>
  );

  if (Object.keys(encryptedNotesMap).length === 0) {
    // Reset the note storage if there is no notes
    resetNoteStorage();
  }

  return encryptedNotesMap;
};

// The `RegistrationStorage` is used to store the registered public keys.
// The key is the note account public key of the user. The values are
// the registered public keys for a given VAnchor.
export type RegistrationStorage = Record<string, string[]>;

export const registrationStorageFactory = (account: string) => {
  return Storage.newFromCache<RegistrationStorage>(account, {
    async commit(key: string, data: RegistrationStorage): Promise<void> {
      if (!isBrowser()) {
        return;
      }

      localStorage.setItem(key, JSON.stringify(data));
    },
    async fetch(key: string): Promise<RegistrationStorage> {
      const defaultResult =
        {} satisfies RegistrationStorage as RegistrationStorage;

      if (!isBrowser()) {
        return defaultResult;
      }

      const storageCached = localStorage.getItem(key);

      if (storageCached) {
        return {
          ...JSON.parse(storageCached),
        };
      }

      return defaultResult;
    },
  });
};

export type NetworkStore = {
  networksConfig: Record<
    number,
    | {
        defaultAccount: string;
      }
    | undefined
  >;
  defaultNetwork?: number;
  defaultWallet?: number;
};

export type NetworkStorage = Storage<NetworkStore>;

export const netStorageFactory = () => {
  return Storage.newFromCache<NetworkStore>('app', {
    async commit(key: string, data: NetworkStore): Promise<void> {
      if (!isBrowser()) {
        return;
      }

      localStorage.setItem(key, JSON.stringify(data));
    },
    async fetch(key: string): Promise<NetworkStore> {
      const store: NetworkStore = {
        networksConfig: {},
        defaultNetwork: undefined,
        defaultWallet: undefined,
      };

      if (!isBrowser()) {
        return store;
      }

      const storageCached = localStorage.getItem(key);
      if (storageCached) {
        return {
          ...store,
          ...JSON.parse(storageCached),
        };
      }
      return store;
    },
  });
};

/**
 * The `MultipleAccountNoteStorage` is used to store the encrypted notes of the user.
 * The key is the note account public key of the user.
 * The value is the encrypted note record.
 * The encrypted note record is a map of resource id to encrypted notes array.
 */
export type MultiAccountNoteStorage = {
  /**
   * The key is the note account public key of the user.
   * The value is the encrypted note record.
   */
  [pubKey: string]: {
    /**
     * The encrypted note record is a map of resource id to encrypted notes array.
     */
    [resourceId: string]: Array<string>;
  };
};

const MULTI_ACCOUNT_NOTE_STORAGE_KEY = 'multiAccountEncryptedNotes';

export const resetMultiAccountNoteStorage = (pubKey: string): void => {
  if (!isBrowser()) {
    return;
  }

  const storage = localStorage.getItem(MULTI_ACCOUNT_NOTE_STORAGE_KEY);
  if (!storage) {
    return;
  }

  const parsedStorage = JSON.parse(storage);
  if (!parsedStorage[pubKey]) {
    return;
  }

  localStorage.setItem(
    MULTI_ACCOUNT_NOTE_STORAGE_KEY,
    JSON.stringify({ ...parsedStorage, [pubKey]: {} })
  );
};

export const multiAccountNoteStorageFactory = () => {
  return Storage.newFromCache<MultiAccountNoteStorage>(
    MULTI_ACCOUNT_NOTE_STORAGE_KEY,
    {
      async commit(key: string, data: MultiAccountNoteStorage): Promise<void> {
        if (!isBrowser()) {
          return;
        }

        localStorage.setItem(key, JSON.stringify(data));
      },
      async fetch(key: string): Promise<MultiAccountNoteStorage> {
        const defaultResult =
          {} satisfies MultiAccountNoteStorage as MultiAccountNoteStorage;

        if (!isBrowser()) {
          return defaultResult;
        }

        const storageCached = localStorage.getItem(key);

        if (storageCached) {
          return {
            ...JSON.parse(storageCached),
          };
        }

        return defaultResult;
      },
    }
  );
};
