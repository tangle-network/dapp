import { ApiPromise, ApiRx } from '@polkadot/api';
import { create } from 'zustand';

export const useApiStore = create<{
  rxCache: Map<string, Promise<ApiRx>>;
  promiseCache: Map<string, Promise<ApiPromise>>;
  createRx: (endpoint: string, factory: () => Promise<ApiRx>) => Promise<ApiRx>;

  createPromise: (
    endpoint: string,
    factory: () => Promise<ApiPromise>,
  ) => Promise<ApiPromise>;
}>((set, getState) => ({
  rxCache: new Map<string, Promise<ApiRx>>(),
  promiseCache: new Map<string, Promise<ApiPromise>>(),
  createRx: async (endpoint, factory) => {
    const { rxCache } = getState();
    const existingEntry = rxCache.get(endpoint);

    if (existingEntry !== undefined) {
      return existingEntry;
    }

    const api = factory();
    const newCache = new Map(rxCache);

    newCache.set(endpoint, api);
    set({ rxCache: newCache });

    return api;
  },
  createPromise: async (endpoint, factory) => {
    const { promiseCache } = getState();
    const existingEntry = promiseCache.get(endpoint);

    if (existingEntry !== undefined) {
      return existingEntry;
    }

    const api = factory();
    const newCache = new Map(promiseCache);

    newCache.set(endpoint, api);
    set({ promiseCache: newCache });

    return api;
  },
}));

export default useApiStore;
