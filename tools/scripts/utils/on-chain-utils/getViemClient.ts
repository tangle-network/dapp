import { chainsConfig } from '@webb-tools/dapp-config/src/chains/chain-config';
import { EVMChainId } from '@webb-tools/dapp-types/src/EVMChainId';
import { parseTypedChainId } from '@webb-tools/sdk-core';
import { Chain } from 'viem';
import { createPublicClient, http } from 'viem';

import * as chains from 'viem/chains';

// At the time of writing, Viem does not support multicall for these chains.
const VIEM_NOT_SUPPORTED_MULTICALL_CHAINS = [EVMChainId.ScrollAlpha];

/**
 * Gets the chain object for the given chain id.
 * @param chainId - Chain id of the target EVM chain.
 * @returns Viem's chain object.
 */
function getViemChain(chainId: number): Chain {
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
    testnet: true,
    nativeCurrency: {
      decimals: 18,
      name: 'ETH',
      symbol: 'ETH',
    },
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
  } as const satisfies Chain;
}

function getViemClient(typedChainId: number) {
  const { chainId } = parseTypedChainId(typedChainId);

  let chain = getViemChain(chainId);
  if (!chain || VIEM_NOT_SUPPORTED_MULTICALL_CHAINS.includes(chainId)) {
    chain = defineViemChain(typedChainId);
  }

  return createPublicClient({
    chain: chain,
    batch: {
      multicall: true,
    },
    transport: http(undefined, { timeout: 60_000 }),
  });
}

export default getViemClient;
