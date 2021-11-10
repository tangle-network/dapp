import { Storage } from '@webb-dapp/utils';

export const anchorDeploymentBlock: Record<string, number> = {
  '0xd24eea4f4e17f7a708b2b156d3b90c921659be80': 5825165,
  '0x8431fdec940555beced3f4c04374c1d60b4ac07e': 9617980,
  '0x03812879bc2cc702956671036463e6873f631786': 11400390,
  '0x0ab17504465cb1b5235c6b4020a65faf070d5cda': 9618040,
  '0x0aa49a86f526e44853a2704984d6a91c7289fc93': 5825250,
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
