import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import { DEFAULT_SS58 } from '@webb-tools/dapp-config/constants/polkadot';
import getPolkadotJsDashboardUrl from '@webb-tools/dapp-config/utils/getPolkadotJsDashboardUrl';
import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import { ChainType } from '@webb-tools/utils';
import {
  Network,
  NetworkId,
  TANGLE_LOCAL_DEV_NETWORK,
  TANGLE_MAINNET_NETWORK,
  TANGLE_TESTNET_NATIVE_NETWORK,
} from '@webb-tools/webb-ui-components/constants/networks';
import assert from 'assert';

const chainToNetworkMap = {
  [PresetTypedChainId.TangleLocalEVM]: TANGLE_LOCAL_DEV_NETWORK,
  [PresetTypedChainId.TangleLocalNative]: TANGLE_LOCAL_DEV_NETWORK,
  [PresetTypedChainId.TangleTestnetEVM]: TANGLE_TESTNET_NATIVE_NETWORK,
  [PresetTypedChainId.TangleTestnetNative]: TANGLE_TESTNET_NATIVE_NETWORK,
  [PresetTypedChainId.TangleMainnetEVM]: TANGLE_MAINNET_NETWORK,
  [PresetTypedChainId.TangleMainnetNative]: TANGLE_MAINNET_NETWORK,
} as const;

/**
 * A mapper function that converts a typed chain id to a network object.
 *
 * @param typedChainId the typed chain id to convert to a network
 * @returns the network object
 * @throws if the chain with the given id is not found in the chainsPopulated object
 * @throws if the chain with the given id has no WebSocket RPC endpoint
 */
export default function chainToNetwork(typedChainId: number): Network {
  const network = chainToNetworkMap[typedChainId];
  if (network !== undefined) {
    return network;
  }

  const chain = chainsPopulated[typedChainId];

  assert(chain !== undefined, `Chain with id ${typedChainId} not found`);
  assert(
    chain.rpcUrls.default.webSocket?.[0],
    `Chain with id ${typedChainId} has no WebSocket RPC endpoint`,
  );

  const wsRpcEndpoint = chain.rpcUrls.default.webSocket[0];

  return {
    id: NetworkId.CUSTOM,
    ...(chain.chainType === ChainType.Substrate ? { chainId: chain.id } : {}),
    ...(chain.chainType === ChainType.EVM ? { evmChainId: chain.id } : {}),
    name: chain.name,
    tokenSymbol: 'tTNT',
    // TODO: Find out the correct way to determine the node type for a chain,
    // maybe the chain group property or something else.
    nodeType: 'standalone',
    polkadotJsDashboardUrl: getPolkadotJsDashboardUrl(wsRpcEndpoint),
    wsRpcEndpoint,
    ...(chain.rpcUrls.default.http?.[0]
      ? {
          httpRpcEndpoint: chain.rpcUrls.default.http[0],
        }
      : {}),
    // The SS58 prefix is only relevant for Substrate chains and by convention
    // it the same with the chain id.
    ss58Prefix:
      chain.chainType === ChainType.Substrate
        ? chain.id
        : DEFAULT_SS58.toNumber(),
  };
}
