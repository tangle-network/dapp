'use client';

import { HexString } from '@polkadot/util/types';
import { useCallback, useEffect, useState } from 'react';

import { BridgeQueueTxItem, TangleTokenSymbol } from '../types';
import Optional from '../utils/Optional';
import { ChainConfig } from '@tangle-network/dapp-config';

export enum LocalStorageKey {
  CUSTOM_RPC_ENDPOINT = 'customRpcEndpoint',
  KNOWN_NETWORK_ID = 'knownNetworkId',
  SUBSTRATE_WALLETS_METADATA = 'substrateWalletsMetadata',
  BRIDGE_TX_QUEUE_BY_ACC = 'bridgeTxQueue',
  BRIDGE_TOKENS_TO_ACC = 'bridgeTokensToAcc',
  BRIDGE_DEST_TX_IDS = 'bridgeDestTxIds',
}

export type SubstrateWalletsMetadataEntry = {
  tokenSymbol: TangleTokenSymbol;
  tokenDecimals: number;
  ss58Prefix: number;
};

export type SubstrateWalletsMetadataCache = Partial<
  Record<HexString, SubstrateWalletsMetadataEntry>
>;

export type TxQueueByAccount = Record<string, BridgeQueueTxItem[]>;

export type BridgeTokensToAcc = Record<string, string[]>; // accountAddress -> tokenAddress[]

export enum BridgeDestTxStatus {
  Completed = 'completed',
  Failed = 'failed',
  Pending = 'pending',
}

export type BridgeDestTxIds = Record<
  string,
  {
    hyperlane: {
      srcTx: string;
      msgId: string;
      destChain: ChainConfig;
      status: BridgeDestTxStatus;
    }[];
    router: {
      srcTx: string;
      status: BridgeDestTxStatus;
    }[];
  }
>; // accountAddress -> { hyperlane: [], router: [] }

/**
 * Type definition associating local storage keys with their
 * respective value types.
 */
export type LocalStorageValueOf<T extends LocalStorageKey> =
  T extends LocalStorageKey.CUSTOM_RPC_ENDPOINT
    ? string
    : T extends LocalStorageKey.KNOWN_NETWORK_ID
      ? number
      : T extends LocalStorageKey.SUBSTRATE_WALLETS_METADATA
        ? SubstrateWalletsMetadataCache
        : T extends LocalStorageKey.BRIDGE_TX_QUEUE_BY_ACC
          ? TxQueueByAccount
          : T extends LocalStorageKey.BRIDGE_TOKENS_TO_ACC
            ? BridgeTokensToAcc
            : T extends LocalStorageKey.BRIDGE_DEST_TX_IDS
              ? BridgeDestTxIds
              : never;

export const getJsonFromLocalStorage = <Key extends LocalStorageKey>(
  key: Key,
): LocalStorageValueOf<Key> | null => {
  const valueString = localStorage.getItem(key);

  // Item was not present in local storage.
  if (valueString === null) {
    return null;
  }

  try {
    // TODO: Move to using zod to validate the value at runtime.
    return JSON.parse(valueString) as LocalStorageValueOf<Key>;
  } catch {
    localStorage.removeItem(key);

    console.warn(
      'Removed corrupted local storage key, which failed to be parsed as JSON:',
      key,
    );

    return null;
  }
};

// TODO: During development cycles, changing local storage value types will lead to
// any users depending on that value to possibly break (because they may be stuck with an older type schema).
// Need a fallback mechanism that erases the old value if applicable (ie. if it's something not important, but rather used for caching).
/**
 * Custom hook for interacting with local storage.
 *
 * Note that the returned value will be `null` initially, until the
 * component is mounted and the value is extracted from local storage.
 *
 * For that reason, if depending on this hook for initial, default states,
 * it's recommended to instead use a `useEffect` and manually retrieve the
 * value from local storage on mount, using the `get` method.
 */
const useLocalStorage = <Key extends LocalStorageKey>(key: Key) => {
  type Value = LocalStorageValueOf<Key>;

  // Initially, the value is `null` until the component is mounted
  // and the value is extracted from local storage.
  const [valueOpt, setValueOpt] = useState<Optional<Value> | null>(null);

  const refresh = useCallback(() => {
    const freshValue = getJsonFromLocalStorage<Key>(key);

    const freshValueOpt = new Optional(
      freshValue === null ? undefined : freshValue,
    );

    setValueOpt(freshValueOpt);

    return freshValueOpt;
  }, [key]);

  // Extract the value from local storage on mount.
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Listen for changes to local storage. This is useful in case
  // that other logic changes the local storage value.
  useEffect(() => {
    const handleStorageChange = () => {
      setValueOpt(refresh());
    };

    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, refresh]);

  const set = useCallback(
    (value: Value) => {
      setValueOpt(new Optional(value));
      localStorage.setItem(key, JSON.stringify(value));
      console.debug('Set local storage value:', key, value);
    },
    [key],
  );

  const isSet = useCallback(() => localStorage.getItem(key) !== null, [key]);

  const remove = useCallback(() => {
    if (!isSet()) {
      return;
    }

    setValueOpt(null);
    localStorage.removeItem(key);
    console.debug('Removed local storage key:', key);
  }, [isSet, key]);

  const setWithPreviousValue = useCallback(
    (updater: (previousValue: Optional<Value> | null) => Value) => {
      const previousValue = refresh();
      const nextValue = updater(previousValue);

      set(nextValue);
    },
    [refresh, set],
  );

  return {
    valueOpt,
    set,
    setWithPreviousValue,
    remove,
    refresh,
    isSet,
  };
};

export default useLocalStorage;
