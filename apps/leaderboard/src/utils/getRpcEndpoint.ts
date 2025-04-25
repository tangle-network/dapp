import { NetworkType } from '@tangle-network/tangle-shared-ui/graphql/graphql';
import { Network } from '../types';
import {
  TANGLE_MAINNET_WS_DWELLIR_RPC_ENDPOINT,
  TANGLE_TESTNET_WS_RPC_ENDPOINT,
} from '@tangle-network/dapp-config';

type GetRpcEndpointResult<TNetwork extends Network> =
  TNetwork extends NetworkType.Testnet
    ? {
        testnetRpc: typeof TANGLE_TESTNET_WS_RPC_ENDPOINT;
        mainnetRpc: undefined;
      }
    : TNetwork extends NetworkType.Mainnet
      ? {
          testnetRpc: undefined;
          mainnetRpc: typeof TANGLE_MAINNET_WS_DWELLIR_RPC_ENDPOINT;
        }
      : TNetwork extends 'all'
        ? {
            testnetRpc: typeof TANGLE_TESTNET_WS_RPC_ENDPOINT;
            mainnetRpc: typeof TANGLE_MAINNET_WS_DWELLIR_RPC_ENDPOINT;
          }
        : never;

export function getRpcEndpoint<TNetwork extends Network>(
  network: TNetwork,
): GetRpcEndpointResult<TNetwork> {
  switch (network) {
    case NetworkType.Testnet:
      return {
        testnetRpc: TANGLE_TESTNET_WS_RPC_ENDPOINT,
        mainnetRpc: undefined,
      } as GetRpcEndpointResult<TNetwork>;
    case NetworkType.Mainnet:
      return {
        testnetRpc: undefined,
        mainnetRpc: TANGLE_MAINNET_WS_DWELLIR_RPC_ENDPOINT,
      } as GetRpcEndpointResult<TNetwork>;
    case 'all':
      return {
        testnetRpc: TANGLE_TESTNET_WS_RPC_ENDPOINT,
        mainnetRpc: TANGLE_MAINNET_WS_DWELLIR_RPC_ENDPOINT,
      } as GetRpcEndpointResult<TNetwork>;
    default:
      throw new Error(`Invalid network: ${network}`);
  }
}
