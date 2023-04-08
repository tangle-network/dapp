import { useCallback, useMemo } from 'react';
import useLocalStorageState from 'use-local-storage-state';

export enum StoreKey {
  accessToken = 'accessToken',
  refreshToken = 'refreshToken',
  expiresIn = 'expiresIn',
  twitterHandle = 'twitterHandle',
}

export const isStoreKey = (key: any): key is StoreKey => {
  return Object.values(StoreKey).includes(key);
};

/**
 * The store type
 */
export type StoreType = {
  /**
   * The access token of the user
   */
  [StoreKey.accessToken]?: string;

  /**
   * The refresh token of the user
   */
  [StoreKey.refreshToken]?: string;

  /**
   * The expiration date of the access token
   */
  [StoreKey.expiresIn]?: string;

  /**
   * The twitter username of the user
   */
  [StoreKey.twitterHandle]?: string;
};

/**
 * Hook for accessing the store (localStorage) from anywhere in the app
 * @returns a getter and setter for the store
 */
const useStore = () => {
  const [accessToken, setAccessToken] = useLocalStorageState<
    StoreType[StoreKey.accessToken]
  >(StoreKey.accessToken);

  const [refreshToken, setRefreshToken] = useLocalStorageState<
    StoreType[StoreKey.refreshToken]
  >(StoreKey.refreshToken);

  const [expiresIn, setExpiresIn] = useLocalStorageState<
    StoreType[StoreKey.expiresIn]
  >(StoreKey.expiresIn);

  const [twitterHandle, setTwitterHandle] = useLocalStorageState<
    StoreType[StoreKey.twitterHandle]
  >(StoreKey.twitterHandle);

  const store = useMemo(
    () => ({
      [StoreKey.accessToken]: accessToken,
      [StoreKey.refreshToken]: refreshToken,
      [StoreKey.expiresIn]: expiresIn,
      [StoreKey.twitterHandle]: twitterHandle,
    }),
    [accessToken, expiresIn, refreshToken, twitterHandle]
  );

  const getStore = useCallback(
    <K extends StoreKey | undefined>(
      key?: K
    ): K extends StoreKey ? StoreType[K] : StoreType => {
      if (key === undefined) {
        return store as K extends StoreKey ? StoreType[K] : StoreType;
      }
      return store[key] as K extends StoreKey ? StoreType[K] : StoreType;
    },
    [store]
  );

  const setStore = useCallback(
    (key: StoreType | StoreKey, value?: StoreType[StoreKey]): void => {
      if (isStoreKey(key)) {
        const storeKey = key as StoreKey;
        const setValue = value as StoreType[StoreKey];
        switch (storeKey) {
          case StoreKey.accessToken:
            setAccessToken(setValue);
            break;
          case StoreKey.refreshToken:
            setRefreshToken(setValue);
            break;
          case StoreKey.expiresIn:
            setExpiresIn(setValue);
            break;
          case StoreKey.twitterHandle:
            setTwitterHandle(setValue);
            break;
          default:
            throw new Error(`Invalid StoreKey: ${storeKey}`);
        }
      } else {
        const newStore = key as StoreType;
        setAccessToken(newStore[StoreKey.accessToken]);
        setRefreshToken(newStore[StoreKey.refreshToken]);
        setExpiresIn(newStore[StoreKey.expiresIn]);
        setTwitterHandle(newStore[StoreKey.twitterHandle]);
      }
    },
    [setAccessToken, setExpiresIn, setRefreshToken, setTwitterHandle]
  );

  return [getStore, setStore] as const;
};

export default useStore;
