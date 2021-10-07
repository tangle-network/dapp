import { Storage } from '@webb-dapp/utils';

export const anchorDeploymentBlock: Record<string, number> = {
  '0x64e9727c4a835d518c34d3a50a8157120caeb32f': 15183626,
  '0xb42139ffcef02dc85db12ac9416a19a12381167d': 9326378,
};

type BridgeStorage = Record<string, { lastQueriedBlock: number; leaves: string[] }>;

export const bridgeCurrencyBridgeStorageFactory = () => {
  // localStorage will have key: <Currency name>, value: { Record<contractAddress: string, info: DynamicMixerInfoStore> }
  return Storage.newFromCache<BridgeStorage>('webb-bridge', {
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
