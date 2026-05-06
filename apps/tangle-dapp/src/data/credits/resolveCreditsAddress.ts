import { Address, zeroAddress } from 'viem';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';

const getEnvAddress = (chainId: number): Address | null => {
  const env = import.meta.env as Record<string, string | undefined>;
  const keyed = env[`VITE_CREDITS_ADDRESS_${chainId}`];
  if (keyed) {
    return keyed as Address;
  }

  const global = env.VITE_CREDITS_ADDRESS;
  return global ? (global as Address) : null;
};

export const resolveCreditsAddress = (chainId?: number): Address | null => {
  if (!chainId) return null;

  const envAddress = getEnvAddress(chainId);
  if (envAddress) {
    return envAddress;
  }

  try {
    const contracts = getContractsByChainId(chainId);
    if (contracts.credits !== zeroAddress) {
      return contracts.credits;
    }
  } catch {
    // ignore unknown chain ids
  }

  return null;
};

export const resolveCreditsTreeUrl = (chainId?: number): string => {
  const env = import.meta.env as Record<string, string | undefined>;
  if (chainId) {
    const keyed = env[`VITE_CREDITS_TREE_URL_${chainId}`];
    if (keyed) {
      return keyed;
    }
  }

  return env.VITE_CREDITS_TREE_URL || '/data/credits-tree.json';
};
