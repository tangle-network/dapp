// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ChainType, computeChainIdType, EVMChainId } from '../chains';
import { Storage } from '../storage';

export type BridgeStorage = Record<string, { lastQueriedBlock: number; leaves: string[] }>;
export type KeypairStorage = Record<string, { keypair: string }>;

export const anchorDeploymentBlock: Record<number, Record<string, number>> = {
  [computeChainIdType(ChainType.EVM, EVMChainId.Ropsten)]: {
    '0x66e04f6ae26c310e39f5bf24d873909e6d3b64c7': 12497372,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.Rinkeby)]: {
    '0x91127f21d63029eb5b2de05b4b1e9fd3497ee95b': 10943907,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.Goerli)]: {
    '0x682faa319bf7bae7f0cb68435e857d22bf976e17': 7146565,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.Kovan)]: {
    '0x148e8037ea12834117f3efd9e8990c16c1ff5653': 32476243,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.PolygonTestnet)]: {
    '0x1371efed369498718bee3eb5d58e5d3dec86be85': 26974489,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.OptimismTestnet)]: {
    '0x5353cede4b8fea148fb1f66f45d3ec27bff2224d': 4464058,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.ArbitrumTestnet)]: {
    '0x4953110789d0cb6de126f4ea88890670ccfe6906': 13335776,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.MoonbaseAlpha)]: {
    '0x0c5f4951f42eec082bd1356b9b41928b4f0e7542': 2397382,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.HermesLocalnet)]: {
    '0xbfce6b877ebff977bb6e80b24fbbb7bc4ebca4df': 100,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.AthenaLocalnet)]: {
    '0x4e3df2073bf4b43b9944b8e5a463b1e185d6448c': 100,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.DemeterLocalnet)]: {
    '0xdB587ef6aaA16b5719CDd3AaB316F0E70473e9Be': 100,
  },
};

export const getAnchorDeploymentBlockNumber = (chainIdType: number, contractAddress: string): number | undefined => {
  return Object.entries(anchorDeploymentBlock[chainIdType]).find(
    (entry) => entry[0].toLowerCase() === contractAddress.toLowerCase()
  )?.[1];
};

// Expects the chainIdType
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

export const keypairStorageFactory = () => {
  // localStorage will have key: 'keypair', value: privKey.toHexString()
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
