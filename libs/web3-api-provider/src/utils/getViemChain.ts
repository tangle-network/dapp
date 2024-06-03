import {
  LOCALNET_CHAIN_IDS,
  chainsConfig,
} from '@webb-tools/dapp-config/chains';
import { DEFAULT_EVM_CURRENCY } from '@webb-tools/dapp-config/currencies';
import * as chains from 'viem/chains';

// At the time of writing, Viem does not support multicall for these chains.
const VIEM_NOT_SUPPORTED_MULTICALL_CHAINS = LOCALNET_CHAIN_IDS;

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

  if (!chain.group) {
    throw new Error(`Chain ${chain.name} does not have a base network`);
  }

  if (!chain.rpcUrls) {
    throw new Error(`Chain ${chain.name} does not have rpc urls`);
  }

  return {
    id: chain.id,
    name: chain.name,
    testnet: true,
    nativeCurrency: DEFAULT_EVM_CURRENCY,
    rpcUrls: chain.rpcUrls,
    blockExplorers: chain.blockExplorers,
    contracts: chain.contracts,
  } as const satisfies chains.Chain;
}

export { VIEM_NOT_SUPPORTED_MULTICALL_CHAINS, defineViemChain, getViemChain };
