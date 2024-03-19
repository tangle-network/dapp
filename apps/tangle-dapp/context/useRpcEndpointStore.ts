'use client';

import { TANGLE_RPC_ENDPOINT } from '@webb-tools/webb-ui-components/constants';
import { z } from 'zod';
import { create } from 'zustand';

import {
  extractFromLocalStorage,
  LocalStorageKey,
} from '../hooks/useLocalStorage';

const zodBooleanString = z
  .union([z.literal('true'), z.literal('false')])
  .transform((string) => string === 'true');

const DEFAULT_RPC_ENDPOINT = zodBooleanString.parse(
  process.env['TANGLE_DAPP_USE_LOCAL_RPC_ENDPOINT']
)
  ? 'ws://127.0.0.1:9944'
  : TANGLE_RPC_ENDPOINT;

// TODO: This is causing a 'window is not defined' error on the console for some reason. It's strange because this file is marked as 'use client', so it should only be used on the client side, where the window object is defined. Maybe it's related to the fact that local storage is being accessed right when this file is imported (at global scope), and there's some internal Next.js logic that clashes with that?
const CACHED_RPC_ENDPOINT = extractFromLocalStorage(
  LocalStorageKey.CUSTOM_RPC_ENDPOINT,
  true
);

// Prefer the cached endpoint if it exists,
// otherwise use the default endpoint.
export const INITIAL_RPC_ENDPOINT = CACHED_RPC_ENDPOINT ?? DEFAULT_RPC_ENDPOINT;

/**
 * A store for the RPC endpoint to use when creating/using
 * Polkadot API instances.
 *
 * If there is a cached endpoint, it will be used as the
 * default value. Otherwise, the default endpoint will be
 * used, which is either the value of the
 * `TANGLE_DAPP_USE_LOCAL_RPC_ENDPOINT` environment variable
 * or the `TANGLE_RPC_ENDPOINT` constant of the testnet.
 *
 * Modifying the endpoint will cause all API instances to be
 * recreated with the new endpoint.
 *
 * This is the reason that the endpoint is stored in a store
 * instead of as a global variable: so that it can be easily
 * accessed and modified from anywhere in the app, while also
 * being able to trigger a recreation of the API
 */
const useRpcEndpointStore = create<{
  rpcEndpoint: string;
  setRpcEndpoint: (endpoint: string) => void;
}>((set) => ({
  rpcEndpoint: INITIAL_RPC_ENDPOINT,
  setRpcEndpoint: (rpcEndpoint) => set({ rpcEndpoint }),
}));

export default useRpcEndpointStore;
