import type { Chain } from 'viem';
import type { ChainConfig } from '../chain-config.interface';

/**
 * Extracts the `viem` chain object from the chain config,
 * the extracted properties must sync with `WebbExtendedChain` type
 * in libs/dapp-config/src/chains/chain-config.interface.ts
 *
 * @param chainConfig the chain config to extract the chain from
 * @returns the `viem` chain object extracted from the chain config
 */
export default function extractChain(chainConfig: ChainConfig): Chain {
  const { chainType, group, tag, env, ...restChain } = chainConfig;

  return restChain;
}
