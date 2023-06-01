import { chainsConfig } from '@webb-tools/dapp-config/src/chains/chain-config';
import { parseTypedChainId } from '@webb-tools/sdk-core';
import { Chain } from 'viem';
import { createPublicClient, http } from 'viem';
import * as chains from 'viem/chains';

/**
 * Gets the chain object for the given chain id.
 * @param chainId - Chain id of the target EVM chain.
 * @returns Viem's chain object.
 */
function getViemChain(chainId: number) {
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
function defineViemChain(typedChainId: number) {
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
    nativeCurrency: {
      decimals: 18,
      name: 'ETH',
      symbol: 'ETH',
    },
    rpcUrls: {
      public: { http: chain.evmRpcUrls },
      default: { http: chain.evmRpcUrls },
    },
    contracts: {
      multicall3: chain.multicall3
        ? {
            address: chain.multicall3.address,
            blockCreated: chain.multicall3.deployedAt,
          }
        : undefined,
    },
  } as const satisfies Chain;
}

function getViemClient(typedChainId: number) {
  const { chainId } = parseTypedChainId(typedChainId);

  let chain = getViemChain(chainId);
  if (!chain) {
    chain = defineViemChain(typedChainId);
  }

  return createPublicClient({
    chain: chain,
    batch: {
      multicall: true,
    },
    transport: http(),
  });
}

export default getViemClient;
