'use client';

// Copyright 2024 @tangle-network/
// SPDX-License-Identifier: Apache-2.0

import { Storage } from '@tangle-network/dapp-types';
import isBrowser from './isBrowser';

export type NetworkStore = {
  networksConfig: Record<
    number,
    | {
        defaultAccount: string;
      }
    | undefined
  >;
  defaultNetwork?: number;
  defaultWallet?: number;
};

export type NetworkStorage = Storage<NetworkStore>;

export const netStorageFactory = () => {
  return Storage.newFromCache<NetworkStore>('app', {
    async commit(key: string, data: NetworkStore): Promise<void> {
      if (!isBrowser()) {
        return;
      }

      localStorage.setItem(key, JSON.stringify(data));
    },
    async fetch(key: string): Promise<NetworkStore> {
      const store: NetworkStore = {
        networksConfig: {},
        defaultNetwork: undefined,
        defaultWallet: undefined,
      };

      if (!isBrowser()) {
        return store;
      }

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
