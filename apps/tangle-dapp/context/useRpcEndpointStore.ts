import { TANGLE_RPC_ENDPOINT } from '@webb-tools/webb-ui-components/constants';
import { z } from 'zod';
import { create } from 'zustand';

const DEFAULT_RPC_ENDPOINT = z
  .boolean()
  .parse(process.env['TANGLE_DAPP_USE_LOCAL_RPC_ENDPOINT'])
  ? 'ws://127.0.0.1:9944'
  : TANGLE_RPC_ENDPOINT;

/**
 * A store for the RPC endpoint to use when creating/using
 * Polkadot API instances.
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
  endpoint: string;
  setEndpoint: (endpoint: string) => void;
}>((set) => ({
  endpoint: DEFAULT_RPC_ENDPOINT,
  setEndpoint: (endpoint) => set({ endpoint }),
}));

export default useRpcEndpointStore;
