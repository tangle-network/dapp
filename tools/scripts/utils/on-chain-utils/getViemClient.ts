import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
import { parseTypedChainId } from '@webb-tools/sdk-core';
import { Chain, createPublicClient, http } from 'viem';

import * as chains from 'viem/chains';

// At the time of writing, Viem does not support multicall for these chains.
const VIEM_NOT_SUPPORTED_MULTICALL_CHAINS: Array<number> = [];

/**
 * Gets the chain object for the given chain id.
 * @param chainId - Chain id of the target EVM chain.
 * @returns Viem's chain object.
 */
function getViemChain(chainId: number): Chain | undefined {
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
function defineViemChain(typedChainId: number): Chain | undefined {
  const chain = chainsConfig[typedChainId];
  if (!chain) {
    throw new Error('Chain not found in the chainsConfig');
  }

  if (!chain.group) {
    throw new Error(`Chain ${chain.name} does not have a base network`);
  }

  if (!chain.rpcUrls) {
    throw new Error(`Chain ${chain.name} does not have evmRpcUrls`);
  }

  return {
    id: chain.id,
    name: chain.name,
    testnet: true,
    nativeCurrency: {
      decimals: 18,
      name: 'ETH',
      symbol: 'ETH',
    },
    rpcUrls: {
      public: { http: chain.rpcUrls.default.http },
      default: { http: chain.rpcUrls.default.http },
    },
    blockExplorers: chain.blockExplorers
      ? {
          default: {
            name: chain.blockExplorers.default.name,
            url: chain.blockExplorers.default.url,
          },
        }
      : undefined,
    contracts: {
      multicall3: chain.contracts?.multicall3
        ? {
            address: chain.contracts.multicall3.address,
            blockCreated: chain.contracts.multicall3.blockCreated,
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
