import { Storage } from '@webb-dapp/utils';
import { WebbEVMChain } from '../evm/SupportedMixers';

export const getStorageName = (chainID: number): string => {
  switch (chainID) {
    case WebbEVMChain.Rinkeby:
      return 'rinkeby';
    case WebbEVMChain.Main:
      return 'main';
    case WebbEVMChain.Beresheet:
      return 'beresheet';
    case WebbEVMChain.Edgeware:
      return 'edgeware';
    default:
      throw new Error('unsupported chain');
  }
}

export type MixerStorage = Record<string, { lastQueriedBlock: number, leaves: string[] }>;

export const evmChainStorageFactory = (chainId: number) => {
  // localStorage will have key: <name of chain>, value: { Record<contractAddress: string, info: DynamicMixerInfoStore> }
  return Storage.newFromCache<MixerStorage>(getStorageName(chainId), {
    async commit(key: string, data: MixerStorage): Promise<void> {
      localStorage.setItem(key, JSON.stringify(data));
    },
    async fetch(key: string): Promise<MixerStorage> {
      const storageCached = localStorage.getItem(key);
      if (storageCached) {
        return {
          ...JSON.parse(storageCached),
        };
      }
      return {

      };
    },
  });
};
