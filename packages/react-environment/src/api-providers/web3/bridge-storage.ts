import { Storage } from '@webb-dapp/utils';

export const anchorDeploymentBlock: Record<string, number> = {
  '0x8db24d0df8cc4cebf275528f7725e560f50329bf': 11528412,
  '0x99285189a0da76dce5d3da6cf71ad3f2b498dc88': 9735243,
  '0xc44a4ecac4f23b6f92485cb1c90dbed75a987bc8': 5942438,
  '0xd961d7cf4d001ec57ff3f6f9f6428b73b7d924bc': 28595192,
  '0xd2e52699762d00f142e2c61280cd87d47b3a3b97': 176775,
  '0x626fec5ffa7bf1ee8ced7dabde545630473e3abb': 7142407,
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
