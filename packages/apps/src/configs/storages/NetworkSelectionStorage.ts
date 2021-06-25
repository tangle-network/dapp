import { Storage } from '@webb-dapp/utils';

export type NetworkSelectionStore = {
  networksConfig: Record<
    number,
    | {
        defaultAccount: string;
      }
    | undefined
  >;
  defaultNetwork: number;
  defaultWallet: number;
};

export type NetworkSelectionStorage = Storage<NetworkSelectionStore>;

export const netStorageFactory = () => {
  return Storage.newFromCache<NetworkSelectionStore>('app', {
    async commit(key: string, data: NetworkSelectionStore): Promise<void> {
      localStorage.setItem(key, JSON.stringify(data));
    },
    async fetch(key: string): Promise<NetworkSelectionStore> {
      const store: NetworkSelectionStore = {
        networksConfig: {},
        defaultNetwork: 1,
        defaultWallet: 1,
      };
      const storageCached = localStorage.getItem(key);
      if (storageCached) {
        return {
          ...store,
          ...JSON.parse(storageCached),
        };
      }
      return store;
    },
  });
};
