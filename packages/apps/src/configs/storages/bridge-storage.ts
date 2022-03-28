import { Storage } from '@webb-dapp/utils';

export const anchorDeploymentBlock: Record<string, number> = {
  '0x97747a4de7302ff7ee3334e33138879469bfecf8': 11795573,
  '0x09b722aa809a076027fa51902e431a8c03e3f8df': 9973527,
  '0x6aa5c74953f7da1556a298c5e129e417410474e2': 6182601,
  '0x12323bcabb342096669d80f968f7a31bdb29d4c4': 23781159,
  '0xc44a4ecac4f23b6f92485cb1c90dbed75a987bc8': 877902,
  '0xd8a8f9629a98eabff31cfa9493f274a4d5e768cd': 8301075,
  '0x4e3df2073bf4b43B9944b8e5A463b1E185D6448C': 1,
  '0xbfce6B877Ebff977bB6e80B24FbBb7bC4eBcA4df': 1,
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
