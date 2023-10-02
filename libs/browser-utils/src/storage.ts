// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import Storage from '@webb-tools/dapp-types/Storage';

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
      localStorage.setItem(key, JSON.stringify(data));
    },
    async fetch(key: string): Promise<BridgeStorage> {
      const storageCached = localStorage.getItem(key);

      if (storageCached) {
        return {
          ...JSON.parse(storageCached),
        };
      }

      return {
        lastQueriedBlock: 0,
        leaves: [],
      };
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
      localStorage.setItem(key, JSON.stringify(data));
    },
    async fetch(key: string): Promise<MultipleKeyPairStorage> {
      const storageCached = localStorage.getItem(key);

      if (storageCached) {
        return {
          ...JSON.parse(storageCached),
        };
      }

      return {};
    },
  });

/**
 * The `NoteStorage` is used to store the encrypted notes of the user.
 * The key is the note account public key of the user.
 * The value is the encrypted note record.
 * The encrypted note record is a map of resource id to encrypted notes array.
 */
export type NoteStorage = {
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

const NOTE_STORAGE_KEY = 'encryptedNotes';

export const resetNoteStorage = () => {
  localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify({}));
};

export const noteStorageFactory = () => {
  return Storage.newFromCache<NoteStorage>(NOTE_STORAGE_KEY, {
    async commit(key: string, data: NoteStorage): Promise<void> {
      localStorage.setItem(key, JSON.stringify(data));
    },
    async fetch(key: string): Promise<NoteStorage> {
      const storageCached = localStorage.getItem(key);

      if (storageCached) {
        return {
          ...JSON.parse(storageCached),
        };
      }

      return {};
    },
  });
};

// The `RegistrationStorage` is used to store the registered public keys.
// The key is the note account public key of the user. The values are
// the registered public keys for a given VAnchor.
export type RegistrationStorage = Record<string, string[]>;

export const registrationStorageFactory = (account: string) => {
  return Storage.newFromCache<RegistrationStorage>(account, {
    async commit(key: string, data: RegistrationStorage): Promise<void> {
      localStorage.setItem(key, JSON.stringify(data));
    },
    async fetch(key: string): Promise<RegistrationStorage> {
      const storageCached = localStorage.getItem(key);

      if (storageCached) {
        return {
          ...JSON.parse(storageCached),
        };
      }

      return {};
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
      localStorage.setItem(key, JSON.stringify(data));
    },
    async fetch(key: string): Promise<NetworkStore> {
      const store: NetworkStore = {
        networksConfig: {},
        defaultNetwork: undefined,
        defaultWallet: undefined,
      };
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
