// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { Storage } from '@nepoche/storage';
import { Keypair } from '@webb-tools/sdk-core';

export type BridgeStorage = Record<string, { lastQueriedBlock: number; leaves: string[] }>;
export const bridgeStorageFactory = (chainIdType: number) => {
  // localStorage will have key: <Currency name>, value: { Record<contractAddress: string, info: DynamicMixerInfoStore> }
  return Storage.newFromCache<BridgeStorage>(chainIdType.toString(), {
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

      return {};
    },
  });
};

export type KeypairStorage = Record<string, { keypair: string | null }>;
export const keypairStorageFactory = () => {
  // localStorage will have key: 'keypair', value: { keypair: privKey.toHexString() | null }
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

// Keypair.pubkey -> targetChainId -> noteString
export type NoteStorage = {
  encryptedNotes: Record<string, string[]>;
};

export const noteStorageFactory = (keypair: Keypair) => {
  // localStorage will have key: Keypair.pubkey, value: Record<targetTypedChainId, EncryptedNote[]>
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

// account -> anchor address -> pubkeys
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
