// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { Storage } from '@webb-tools/storage';
import { Keypair } from '@webb-tools/sdk-core';

/// The `BridgeStorage` is used to store the leaves of the merkle tree
/// of the underlying VAnchor contract. The key is the resource id
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

/// The `KeypairStorage` is used to store the keypairs of the user.
export type KeypairStorage = Record<string, { keypair: string | null }>;
export const keypairStorageFactory = () => {
  return Storage.newFromCache<KeypairStorage>('keypair', {
    async commit(key: string, data: KeypairStorage): Promise<void> {
      localStorage.setItem(key, JSON.stringify(data));
    },
    async fetch(key: string): Promise<KeypairStorage> {
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

/// The `NoteStorage` is used to store the encrypted notes of the user.
/// The key is the public key of the user.
/// The `NoteStorage` is used to store the encrypted notes of the user.
/// The key is the resource id.
export type NoteStorage = {
  encryptedNotes: {
    [resourceId: string]: string[];
  };
};
export const noteStorageFactory = (keypair: Keypair) => {
  return Storage.newFromCache<NoteStorage>(keypair.toString(), {
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

      return {
        encryptedNotes: {},
      };
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
