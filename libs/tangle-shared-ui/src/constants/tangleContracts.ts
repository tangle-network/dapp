import { Address } from 'viem';

/**
 * Tangle contract addresses by chain ID.
 * These are the deployed addresses for the Tangle.sol contract on each supported network.
 */
const TANGLE_CONTRACT_ADDRESSES: Record<number, Address> = {
  // Tangle Mainnet
  5845: '0x0000000000000000000000000000000000000000' as Address, // TODO: Add mainnet address
  // Tangle Testnet
  3799: '0x0000000000000000000000000000000000000000' as Address, // TODO: Add testnet address
  // Base Mainnet
  8453: '0x0000000000000000000000000000000000000000' as Address, // TODO: Add Base mainnet address
  // Base Sepolia
  84532: '0x0000000000000000000000000000000000000000' as Address, // TODO: Add Base Sepolia address
  // Arbitrum One
  42161: '0x0000000000000000000000000000000000000000' as Address, // TODO: Add Arbitrum address
  // Arbitrum Sepolia
  421614: '0x0000000000000000000000000000000000000000' as Address, // TODO: Add Arbitrum Sepolia address
};

/**
 * MultiAssetDelegation contract addresses by chain ID.
 */
const MULTI_ASSET_DELEGATION_ADDRESSES: Record<number, Address> = {
  // Tangle Mainnet
  5845: '0x0000000000000000000000000000000000000000' as Address, // TODO: Add mainnet address
  // Tangle Testnet
  3799: '0x0000000000000000000000000000000000000000' as Address, // TODO: Add testnet address
  // Base Mainnet
  8453: '0x0000000000000000000000000000000000000000' as Address, // TODO: Add Base mainnet address
  // Base Sepolia
  84532: '0x0000000000000000000000000000000000000000' as Address, // TODO: Add Base Sepolia address
  // Arbitrum One
  42161: '0x0000000000000000000000000000000000000000' as Address, // TODO: Add Arbitrum address
  // Arbitrum Sepolia
  421614: '0x0000000000000000000000000000000000000000' as Address, // TODO: Add Arbitrum Sepolia address
};

/**
 * Get the Tangle contract address for a given chain ID.
 */
export const getTangleContractAddress = (chainId: number): Address | null => {
  return TANGLE_CONTRACT_ADDRESSES[chainId] ?? null;
};

/**
 * Get the MultiAssetDelegation contract address for a given chain ID.
 */
export const getMultiAssetDelegationAddress = (
  chainId: number,
): Address | null => {
  return MULTI_ASSET_DELEGATION_ADDRESSES[chainId] ?? null;
};

export { TANGLE_CONTRACT_ADDRESSES, MULTI_ASSET_DELEGATION_ADDRESSES };
