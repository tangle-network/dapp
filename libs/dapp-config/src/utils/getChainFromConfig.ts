import type { ChainConfig } from '../chains/chain-config.interface';
import chainsPopulated from '../chains/chainsPopulated';

/**
 * Get the chain (with supported wallets populated) from the chain config,
 * or throw if no chain is found for the chain config.
 * @param chainCfg the chain config to find the chain for
 * @returns the chain with supported wallets populated
 * @throws if no chain is found for the chain config, indicating a misconfiguration
 */
function getChainFromConfig(chainCfg: ChainConfig) {
  const chain = Object.values(chainsPopulated).find(
    (chain) => chain.id === chainCfg.id && chain.chainType === chain.chainType
  );

  if (!chain) {
    throw new Error(`No chain found for chain config ${chainCfg.name}`);
  }

  return chain;
}

export default getChainFromConfig;
