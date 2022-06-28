// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ChainType, computeChainIdType, EVMChainId } from '../chains';
import { Storage } from '../storage';

export type BridgeStorage = Record<string, { lastQueriedBlock: number; leaves: string[] }>;
export type KeypairStorage = Record<string, { keypair: string }>;

export const anchorDeploymentBlock: Record<number, Record<string, number>> = {
  [computeChainIdType(ChainType.EVM, EVMChainId.Ropsten)]: {
    '0x53590FF8d6FddC12e9651017F5399d06Dc925C71': 12483374,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.Rinkeby)]: {
    '0x5CaedaFEf2Fd8B4DF34B2d16134204dFC6b3F6b3': 10932204,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.Goerli)]: {
    '0xE24A63Ebb690d0d6C241FDd4aA8ad90421f91D8a': 7134900,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.Kovan)]: {
    '0x1066C35e76c565cbd65FB3a6CB4C6B3161C302B4': 32437592,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.PolygonTestnet)]: {
    '0xe76187266aDFcEcd7CACa83B8F76d7333a592E81': 26946665,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.OptimismTestnet)]: {
    '0xB6836ace175ca5144b966F0633fCf0057E47595B': 4377500,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.ArbitrumTestnet)]: {
    '0x5353cede4b8fea148fb1f66f45d3ec27bff2224d': 13299500,
  },
  [computeChainIdType(ChainType.EVM, EVMChainId.MoonbaseAlpha)]: {
    '0x0D8D947EB29284a8f7c28E8bAA978E913bf6F5AF': 2384295,
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
