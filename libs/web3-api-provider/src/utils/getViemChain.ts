import {
  DEFAULT_EVM_CURRENCY,
  LOCALNET_CHAIN_IDS,
  chainsConfig,
} from '@webb-tools/dapp-config';
import { EVMChainId } from '@webb-tools/dapp-types';
import * as chains from 'viem/chains';

// At the time of writing, Viem does not support multicall for these chains.
const VIEM_NOT_SUPPORTED_MULTICALL_CHAINS = [EVMChainId.ScrollAlpha].concat(
  LOCALNET_CHAIN_IDS
);

/**
 * Gets the chain object for the given chain id.
 * @param chainId - Chain id of the target EVM chain.
 * @returns Viem's chain object.
 */
function getViemChain(chainId: number): chains.Chain | undefined {
  for (const chain of Object.values(chains)) {
    if (chain.id === chainId) {
      return chain;
    }
  }
}

/**
 * Defines the Viem chain object from the org chain config.
 * @returns Viem's chain object.
 */
function defineViemChain(typedChainId: number): chains.Chain {
  const chain = chainsConfig[typedChainId];
  if (!chain) {
    throw new Error('Chain not found in the chainsConfig');
  }

  if (!chain.base) {
    throw new Error(`Chain ${chain.name} does not have a base network`);
  }

  if (!chain.evmRpcUrls) {
    throw new Error(`Chain ${chain.name} does not have evmRpcUrls`);
  }

  return {
    id: chain.chainId,
    name: chain.name,
    network: chain.base,
    testnet: true,
    nativeCurrency: DEFAULT_EVM_CURRENCY,
    rpcUrls: {
      public: { http: chain.evmRpcUrls },
      default: { http: chain.evmRpcUrls },
    },
    blockExplorers: chain.blockExplorerStub
      ? {
          default: {
            name: chain.name,
            url: chain.blockExplorerStub,
          },
        }
      : undefined,
    contracts: {
      multicall3: chain.multicall3
        ? {
            address: chain.multicall3.address,
            blockCreated: chain.multicall3.deployedAt,
          }
        : undefined,
    },
  } as const satisfies chains.Chain;
}

export { getViemChain, defineViemChain, VIEM_NOT_SUPPORTED_MULTICALL_CHAINS };
