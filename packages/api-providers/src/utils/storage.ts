// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { NetworkStore } from '@webb-dapp/api-providers/abstracts';
import { calculateTypedChainId, ChainType, Keypair } from '@webb-tools/sdk-core';

import { EVMChainId } from '../chains';
import { Storage } from '../storage';

export const anchorDeploymentBlock: Record<number, Record<string, number>> = {
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Ropsten)]: {
    '0x66e04f6ae26c310e39f5bf24d873909e6d3b64c7': 12497372,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Rinkeby)]: {
    '0x91127f21d63029eb5b2de05b4b1e9fd3497ee95b': 10943907,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Goerli)]: {
    '0x682faa319bf7bae7f0cb68435e857d22bf976e17': 7146565,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Kovan)]: {
    '0x148e8037ea12834117f3efd9e8990c16c1ff5653': 32476243,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.PolygonTestnet)]: {
    '0x1371efed369498718bee3eb5d58e5d3dec86be85': 26974489,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.OptimismTestnet)]: {
    '0x5353cede4b8fea148fb1f66f45d3ec27bff2224d': 4464058,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.ArbitrumTestnet)]: {
    '0x4953110789d0cb6de126f4ea88890670ccfe6906': 13335776,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.MoonbaseAlpha)]: {
    '0x0c5f4951f42eec082bd1356b9b41928b4f0e7542': 2397382,
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
  return Storage.newFromCache<NoteStorage>(keypair.pubkey.toString(), {
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
