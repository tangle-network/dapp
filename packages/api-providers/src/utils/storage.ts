// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { NetworkStore } from '@webb-dapp/api-providers/abstracts';
import { calculateTypedChainId, ChainType, Keypair } from '@webb-tools/sdk-core';

import { EVMChainId } from '../chains';
import { Storage } from '../storage';

export const anchorDeploymentBlock: Record<number, Record<string, number>> = {
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Ropsten)]: {
    '0x35295fbb71273b84f66e70b8e341d408150dcaf9': 12864534,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Rinkeby)]: {
    '0x7ae23a95881bf8ab86174e89bd79199f398d19bf': 11266630,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Goerli)]: {
    '0x4e22da303c403daaf4653d3d9d63ef009bae89a6': 7471990,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.PolygonTestnet)]: {
    '0xe6b075ecc4ccbc6e66569b1a2984cc47e88ee246': 27776591,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.OptimismTestnet)]: {
    '0x12f2c4a1469b035e4459539e38ae68bc4dd5ba07': 640396,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.ArbitrumTestnet)]: {
    '0x91a9a1e76fa609f6ba8fcd718a60b030678765ad': 171869,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.MoonbaseAlpha)]: {
    '0xc6b43568f0c39e3a68b597a3bb54a7b9e4308bf3': 2723239,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.HermesLocalnet)]: {
    '0xbfce6b877ebff977bb6e80b24fbbb7bc4ebca4df': 95,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.AthenaLocalnet)]: {
    '0xcd75Ad7AC9C9325105f798c476E84176648F391A': 95,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.DemeterLocalnet)]: {
    '0x4e3df2073bf4b43B9944b8e5A463b1E185D6448C': 95,
  },
};

export const getAnchorDeploymentBlockNumber = (chainIdType: number, contractAddress: string): number | undefined => {
  return Object.entries(anchorDeploymentBlock[chainIdType]).find(
    (entry) => entry[0].toLowerCase() === contractAddress.toLowerCase()
  )?.[1];
};

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
