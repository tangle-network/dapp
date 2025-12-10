// Contract addresses for different networks
// These are derived from tnt-core deployments

import { Address } from 'viem';

export type ContractAddresses = {
  tangle: Address;
  multiAssetDelegation: Address;
  masterBlueprintServiceManager: Address;
  operatorStatusRegistry: Address;
  rewardVaults: Address;
  inflationPool: Address;
  credits: Address;
  liquidDelegationFactory: Address;
};

// Local Anvil deployment addresses (from tnt-core/indexer/config.yaml)
export const LOCAL_CONTRACTS: ContractAddresses = {
  tangle: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  multiAssetDelegation: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  masterBlueprintServiceManager: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
  operatorStatusRegistry: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
  // Placeholder addresses - not deployed locally yet
  rewardVaults: '0x0000000000000000000000451234512121212444',
  inflationPool: '0x0000000000000000000000551234512345123555',
  credits: '0x0000000000000000000000651234512121212666',
  liquidDelegationFactory: '0x0000000000000000000000000000000000000101',
};

// Base Sepolia testnet addresses (to be updated after deployment)
export const BASE_SEPOLIA_CONTRACTS: ContractAddresses = {
  tangle: '0x0000000000000000000000000000000000000000',
  multiAssetDelegation: '0x0000000000000000000000000000000000000000',
  masterBlueprintServiceManager: '0x0000000000000000000000000000000000000000',
  operatorStatusRegistry: '0x0000000000000000000000000000000000000000',
  rewardVaults: '0x0000000000000000000000000000000000000000',
  inflationPool: '0x0000000000000000000000000000000000000000',
  credits: '0x0000000000000000000000000000000000000000',
  liquidDelegationFactory: '0x0000000000000000000000000000000000000000',
};

// Base mainnet addresses (to be updated after deployment)
export const BASE_MAINNET_CONTRACTS: ContractAddresses = {
  tangle: '0x0000000000000000000000000000000000000000',
  multiAssetDelegation: '0x0000000000000000000000000000000000000000',
  masterBlueprintServiceManager: '0x0000000000000000000000000000000000000000',
  operatorStatusRegistry: '0x0000000000000000000000000000000000000000',
  rewardVaults: '0x0000000000000000000000000000000000000000',
  inflationPool: '0x0000000000000000000000000000000000000000',
  credits: '0x0000000000000000000000000000000000000000',
  liquidDelegationFactory: '0x0000000000000000000000000000000000000000',
};

// Arbitrum Sepolia testnet addresses (to be updated after deployment)
export const ARBITRUM_SEPOLIA_CONTRACTS: ContractAddresses = {
  tangle: '0x0000000000000000000000000000000000000000',
  multiAssetDelegation: '0x0000000000000000000000000000000000000000',
  masterBlueprintServiceManager: '0x0000000000000000000000000000000000000000',
  operatorStatusRegistry: '0x0000000000000000000000000000000000000000',
  rewardVaults: '0x0000000000000000000000000000000000000000',
  inflationPool: '0x0000000000000000000000000000000000000000',
  credits: '0x0000000000000000000000000000000000000000',
  liquidDelegationFactory: '0x0000000000000000000000000000000000000000',
};

// Arbitrum One mainnet addresses (to be updated after deployment)
export const ARBITRUM_ONE_CONTRACTS: ContractAddresses = {
  tangle: '0x0000000000000000000000000000000000000000',
  multiAssetDelegation: '0x0000000000000000000000000000000000000000',
  masterBlueprintServiceManager: '0x0000000000000000000000000000000000000000',
  operatorStatusRegistry: '0x0000000000000000000000000000000000000000',
  rewardVaults: '0x0000000000000000000000000000000000000000',
  inflationPool: '0x0000000000000000000000000000000000000000',
  credits: '0x0000000000000000000000000000000000000000',
  liquidDelegationFactory: '0x0000000000000000000000000000000000000000',
};

// Get contracts by chain ID
export const getContractsByChainId = (chainId: number): ContractAddresses => {
  switch (chainId) {
    case 31337: // Anvil/Hardhat local
      return LOCAL_CONTRACTS;
    case 84532: // Base Sepolia
      return BASE_SEPOLIA_CONTRACTS;
    case 8453: // Base Mainnet
      return BASE_MAINNET_CONTRACTS;
    case 421614: // Arbitrum Sepolia
      return ARBITRUM_SEPOLIA_CONTRACTS;
    case 42161: // Arbitrum One
      return ARBITRUM_ONE_CONTRACTS;
    default:
      throw new Error(`Unknown chain ID: ${chainId}`);
  }
};
