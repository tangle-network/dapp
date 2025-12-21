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

/**
 * Migration Claim contract addresses for the TNT token migration
 */
export type MigrationClaimAddresses = {
  /** The TNT ERC20 token */
  tntToken: Address;
  /** The Migration Claim contract */
  migrationClaim: Address;
  /** Treasury address for unclaimed funds */
  treasury: Address;
};

// SP1 Verifier Gateway addresses (Groth16) - same across all supported chains
export const SP1_VERIFIER_GATEWAY = {
  baseSepolia: '0x397A5f7f3dBd538f23DE225B51f532c34448dA9B' as Address,
  baseMainnet: '0x397A5f7f3dBd538f23DE225B51f532c34448dA9B' as Address,
};

// Local Anvil deployment addresses (from tnt-core/indexer/config.yaml)
export const LOCAL_CONTRACTS: ContractAddresses = {
  tangle: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  multiAssetDelegation: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  masterBlueprintServiceManager: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
  operatorStatusRegistry: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
  rewardVaults: '0xc5a5C42992dECbae36851359345FE25997F5C42d',
  inflationPool: '0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E',
  credits: '0x0000000000000000000000651234512121212666',
  liquidDelegationFactory: '0xCA8c8688914e0F7096c920146cd0Ad85cD7Ae8b9',
};

// Base Sepolia testnet addresses (local development)
export const BASE_SEPOLIA_CONTRACTS: ContractAddresses = {
  tangle: '0x62281eac026f6c6a65708157e47151b964216303',
  multiAssetDelegation: '0x96e682cc18874ec6cdb1b2a7f0a5f541e1fbaeb3',
  masterBlueprintServiceManager: '0x0000000000000000000000000000000000000000', // Not in base-sepolia manifest
  operatorStatusRegistry: '0x17746107e0b4cfaf4c96140f5e501bf10e740b65',
  rewardVaults: '0x37979744708141ec1541b9b70faa7da8d0cf2d23',
  inflationPool: '0x8152f13c37576e1a2cd74d18213105ecf816d5de',
  credits: '0x0000000000000000000000000000000000000000', // Set via env or future deploys
  liquidDelegationFactory: '0xF8e31cb472bc70500f08Cd84917E5A1912Ec8397',
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

// Ethereum Mainnet - Only used for Native Restaking (ValidatorPod/ValidatorPodManager)
// Regular restaking contracts are NOT deployed on Ethereum mainnet
export const ETHEREUM_MAINNET_CONTRACTS: ContractAddresses = {
  tangle: '0x0000000000000000000000000000000000000000',
  multiAssetDelegation: '0x0000000000000000000000000000000000000000',
  masterBlueprintServiceManager: '0x0000000000000000000000000000000000000000',
  operatorStatusRegistry: '0x0000000000000000000000000000000000000000',
  rewardVaults: '0x0000000000000000000000000000000000000000',
  inflationPool: '0x0000000000000000000000000000000000000000',
  credits: '0x0000000000000000000000000000000000000000',
  liquidDelegationFactory: '0x0000000000000000000000000000000000000000',
};

// Ethereum Holesky Testnet - Only used for Native Restaking (ValidatorPod/ValidatorPodManager)
// Regular restaking contracts are NOT deployed on Holesky
export const ETHEREUM_HOLESKY_CONTRACTS: ContractAddresses = {
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
    case 1: // Ethereum Mainnet (for Native Restaking only)
      return ETHEREUM_MAINNET_CONTRACTS;
    case 17000: // Ethereum Holesky Testnet (for Native Restaking only)
      return ETHEREUM_HOLESKY_CONTRACTS;
    default:
      throw new Error(`Unknown chain ID: ${chainId}`);
  }
};

// Migration Claim contract addresses (to be updated after deployment)
// These are separate from the main restaking contracts

export const BASE_SEPOLIA_MIGRATION: MigrationClaimAddresses = {
  tntToken: '0x0000000000000000000000000000000000000000', // To be deployed
  migrationClaim: '0x0000000000000000000000000000000000000000', // To be deployed
  treasury: '0x0000000000000000000000000000000000000000', // To be set
};

export const BASE_MAINNET_MIGRATION: MigrationClaimAddresses = {
  tntToken: '0x0000000000000000000000000000000000000000', // To be deployed
  migrationClaim: '0x0000000000000000000000000000000000000000', // To be deployed
  treasury: '0x0000000000000000000000000000000000000000', // To be set
};

export const getMigrationContractsByChainId = (
  chainId: number,
): MigrationClaimAddresses | null => {
  switch (chainId) {
    case 84532: // Base Sepolia
      return BASE_SEPOLIA_MIGRATION;
    case 8453: // Base Mainnet
      return BASE_MAINNET_MIGRATION;
    default:
      return null; // Migration not available on other chains
  }
};
