import {
  TANGLE_MAINNET_WS_RPC_ENDPOINT,
  TANGLE_TESTNET_WS_RPC_ENDPOINT,
} from '@tangle-network/dapp-config';
import { Network } from '../types';

type GetRpcEndpointResult<TNetwork extends Network> = TNetwork extends 'TESTNET'
  ? {
      testnetRpc: typeof TANGLE_TESTNET_WS_RPC_ENDPOINT;
      mainnetRpc: undefined;
    }
  : TNetwork extends 'MAINNET'
    ? {
        testnetRpc: undefined;
        mainnetRpc: typeof TANGLE_MAINNET_WS_RPC_ENDPOINT;
      }
    : TNetwork extends 'ALL'
      ? {
          testnetRpc: typeof TANGLE_TESTNET_WS_RPC_ENDPOINT;
          mainnetRpc: typeof TANGLE_MAINNET_WS_RPC_ENDPOINT;
        }
      : never;

export function getRpcEndpoint<TNetwork extends Network>(
  network: TNetwork,
): GetRpcEndpointResult<TNetwork> {
  switch (network) {
    case 'TESTNET':
      return {
        testnetRpc: TANGLE_TESTNET_WS_RPC_ENDPOINT,
        mainnetRpc: undefined,
      } as GetRpcEndpointResult<TNetwork>;
    case 'MAINNET':
      return {
        testnetRpc: undefined,
        mainnetRpc: TANGLE_MAINNET_WS_RPC_ENDPOINT,
      } as GetRpcEndpointResult<TNetwork>;
    case 'ALL':
      return {
        testnetRpc: TANGLE_TESTNET_WS_RPC_ENDPOINT,
        mainnetRpc: TANGLE_MAINNET_WS_RPC_ENDPOINT,
      } as GetRpcEndpointResult<TNetwork>;
    default:
      throw new Error(`Invalid network: ${network}`);
  }
}
