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
  const [accessToken, setAccessToken, { removeItem: removeAccessToken }] =
    useLocalStorageState<StoreType[StoreKey.accessToken]>(StoreKey.accessToken);

  const [refreshToken, setRefreshToken, { removeItem: removeRefreshToken }] =
    useLocalStorageState<StoreType[StoreKey.refreshToken]>(
      StoreKey.refreshToken
    );

  const [expiresIn, setExpiresIn, { removeItem: removeExpiresIn }] =
    useLocalStorageState<StoreType[StoreKey.expiresIn]>(StoreKey.expiresIn);

  const [twitterHandle, setTwitterHandle, { removeItem: removeTwitterHandle }] =
    useLocalStorageState<StoreType[StoreKey.twitterHandle]>(
      StoreKey.twitterHandle
    );

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

  const setStoreByKey = useCallback(
    (key: StoreKey, value: StoreType[StoreKey]): void => {
      switch (key) {
        case StoreKey.accessToken:
          setAccessToken(value);
          break;
        case StoreKey.refreshToken:
          setRefreshToken(value);
          break;
        case StoreKey.expiresIn:
          setExpiresIn(value);
          break;
        case StoreKey.twitterHandle:
          setTwitterHandle(value);
          break;
        default:
          throw new Error(`Invalid StoreKey: ${key}`);
      }
    },
    [setAccessToken, setExpiresIn, setRefreshToken, setTwitterHandle]
  );

  const removeStore = useCallback(
    (key: StoreKey): void => {
      switch (key) {
        case StoreKey.accessToken:
          removeAccessToken();
          break;
        case StoreKey.refreshToken:
          removeRefreshToken();
          break;
        case StoreKey.expiresIn:
          removeExpiresIn();
          break;
        case StoreKey.twitterHandle:
          removeTwitterHandle();
          break;
        default:
          throw new Error(`Invalid StoreKey: ${key}`);
      }
    },
    [removeAccessToken, removeExpiresIn, removeRefreshToken, removeTwitterHandle] // prettier-ignore
  );

  const setStore = useCallback(
    (key: StoreType | StoreKey, value?: StoreType[StoreKey]): void => {
      if (isStoreKey(key)) {
        const storeKey = key as StoreKey;
        const setValue = value as StoreType[StoreKey];
        setStoreByKey(storeKey, setValue);
      } else {
        const newStore = key as StoreType;
        if (newStore[StoreKey.accessToken]) {
          setStoreByKey(StoreKey.accessToken, newStore[StoreKey.accessToken]);
        } else {
          removeStore(StoreKey.accessToken);
        }

        if (newStore[StoreKey.refreshToken]) {
          setStoreByKey(StoreKey.refreshToken, newStore[StoreKey.refreshToken]);
        } else {
          removeStore(StoreKey.refreshToken);
        }

        if (newStore[StoreKey.expiresIn]) {
          setStoreByKey(StoreKey.expiresIn, newStore[StoreKey.expiresIn]);
        } else {
          removeStore(StoreKey.expiresIn);
        }

        if (newStore[StoreKey.twitterHandle]) {
          setStoreByKey(
            StoreKey.twitterHandle,
            newStore[StoreKey.twitterHandle]
          );
        } else {
          removeStore(StoreKey.twitterHandle);
        }
      }
    },
    [removeStore, setStoreByKey]
  );

  return [getStore, setStore] as const;
};

export default useStore;
