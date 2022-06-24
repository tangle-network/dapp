// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ChainType, computeChainIdType, EVMChainId } from '../chains';
import { Storage } from '../storage';

export type BridgeStorage = Record<string, { lastQueriedBlock: number; leaves: string[] }>;
export type KeypairStorage = Record<string, { keypair: string }>;

export const anchorDeploymentBlock: Record<number, Record<string, number>> = {
  [computeChainIdType(ChainType.EVM, EVMChainId.Ropsten)]: {
    '0x228ac202fb6ad3d3a39f59e4a578a0eafd3286cd': 12270712,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.Rinkeby)]: {
    '0xa238c5987142af720b9232d9d72a12a3868396e0': 10688388,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.Goerli)]: {
    '0x03b88ed9ff9be84e4bad3f55d67ae5aba610523c': 6896976,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.PolygonTestnet)]: {
    '0xa8665042ea4767fa09143bd790059ce53bdf2a8f': 26340732,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.OptimismTestnet)]: {
    '0x09d2d6520be3922549c81885477258f41c96c43f': 3040092,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.ArbitrumTestnet)]: {
    '0x2d21bc3f8cb399d3b7091309afe1986cdb9f2e39': 11938915,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.HermesLocalnet)]: {
    '0xbfce6b877ebff977bb6e80b24fbbb7bc4ebca4df': 1,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.AthenaLocalnet)]: {
    '0x4e3df2073bf4b43b9944b8e5a463b1e185d6448c': 1,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.DemeterLocalnet)]: {
    '0xdB587ef6aaA16b5719CDd3AaB316F0E70473e9Be': 1,
  },
};

export const getAnchorDeploymentBlockNumber = (chainIdType: number, contractAddress: string): number | undefined => {
  return Object.entries(anchorDeploymentBlock[chainIdType]).find(
    (entry) => entry[0] === contractAddress.toLowerCase()
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
