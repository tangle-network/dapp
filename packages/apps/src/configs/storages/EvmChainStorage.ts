import { getEVMChainName } from '@webb-dapp/apps/configs/';
import { Storage } from '@webb-dapp/utils';

export type MixerStorage = Record<string, { lastQueriedBlock: number; leaves: string[] }>;

export const evmChainStorageFactory = (chainId: number) => {
  // localStorage will have key: <name of chain>, value: { Record<contractAddress: string, info: DynamicMixerInfoStore> }
  return Storage.newFromCache<MixerStorage>(getEVMChainName(chainId), {
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
      return {};
    },
  });
};
