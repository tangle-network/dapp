import { Storage } from '@webb-dapp/utils';

export const getStorageName = (chainID: number): string => {
  switch (chainID) {
    case 4:
      return 'rinkeby';
    case 1:
      return 'main';
    case 2022:
      return 'beresheet';
    case 2021:
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
