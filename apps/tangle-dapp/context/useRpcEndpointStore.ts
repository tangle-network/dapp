'use client';

import { TANGLE_RPC_ENDPOINT } from '@webb-tools/webb-ui-components/constants';
import { create } from 'zustand';

// TODO: Can remove this .env key since it's not needed anymore, since the user can switch networks in the UI directly.
const DEFAULT_RPC_ENDPOINT =
  process.env['TANGLE_DAPP_USE_LOCAL_RPC_ENDPOINT'] !== ''
    ? 'ws://127.0.0.1:9944'
    : TANGLE_RPC_ENDPOINT;

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
  rpcEndpoint: DEFAULT_RPC_ENDPOINT,
  setRpcEndpoint: (rpcEndpoint) => set({ rpcEndpoint }),
}));

export default useRpcEndpointStore;
