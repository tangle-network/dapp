import { Storage } from '@webb-dapp/utils';

export const anchorDeploymentBlock: Record<string, number> = {
  '0x67113f749696ca459ccca451d7686561c5a69172': 11752738,
  '0x60897804fc2c3ab55be07d2f77c7900eba218b5e': 9933940,
  '0xe0d36e297f63991fa9ea39fba26a6d3f359aa70a': 6142999,
  '0x6f82483876ab96dd948805db93da675e920362ed': 23531544,
  '0x4446bccbde6d906e0cd65a55eb13913018ab1f58': 757506,
  '0xaabfe16c55062a9446d06c4f8ff7a64ff750fb27': 8129577,
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
