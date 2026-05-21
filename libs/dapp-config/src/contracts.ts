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

// Local Anvil deployment addresses (from LocalTestnet.s.sol deployment)
// IMPORTANT: These addresses are from broadcast/LocalTestnet.s.sol/31337/run-latest.json
// When running start-local-dev.sh, addresses are deterministic.
// Use proxy addresses for upgradeable contracts (check ERC1967Proxy transactions).
export const LOCAL_CONTRACTS: ContractAddresses = {
  tangle: '0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9', // Proxy
  multiAssetDelegation: '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512', // Proxy
  masterBlueprintServiceManager: '0xc351628eb244ec633d5f21fbd6621e1a683b1181', // Proxy
  operatorStatusRegistry: '0x17746107e0b4cfaf4c96140f5e501bf10e740b65', // Proxy
  rewardVaults: '0x04c89607413713ec9775e14b954286519d836fef', // Proxy
  inflationPool: '0x21df544947ba3e8b3c32561399e88b52dc8b2823', // Proxy
  credits: '0x922d6956c99e12dfeb3224dea977d0939758a1fe', // Proxy
  liquidDelegationFactory: '0xc66ab83418c20a65c3f8e83b3d11c8c3a6097b6f', // Direct
};

// Base Sepolia testnet addresses (synced from tnt-core deployments/base-sepolia/latest.json)
export const BASE_SEPOLIA_CONTRACTS: ContractAddresses = {
  tangle: '0xc9b0716a187072be0f38a5d972392c6479b9cfe3',
  multiAssetDelegation: '0xfeb417fc6d343e0fc88ec9fdb8294bf84d69f0ca',
  masterBlueprintServiceManager: '0xf259444a865f64bfbbf7ec3e9e4b9af00a819e17',
  operatorStatusRegistry: '0x81443688fce1e4edb822c1d5794c3dac608e9a23',
  rewardVaults: '0x8affb8c215679210329ef9129d8427fa4e7bd087',
  inflationPool: '0x2c44736aaf0eec7c9b852ee71f0dc05b1606803b',
  credits: '0xeeba50602c52096091cce56cdb12ca1df049542a',
  liquidDelegationFactory: '0x0000000000000000000000000000000000000000', // not deployed in this release
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

// Ethereum Mainnet - Only used for native staking (ValidatorPod/ValidatorPodManager)
// Core staking/service contracts are not deployed on Ethereum mainnet
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

// Ethereum Holesky Testnet - Only used for native staking (ValidatorPod/ValidatorPodManager)
// Core staking/service contracts are not deployed on Holesky
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
    case 1: // Ethereum Mainnet (native staking only)
      return ETHEREUM_MAINNET_CONTRACTS;
    case 17000: // Ethereum Holesky Testnet (native staking only)
      return ETHEREUM_HOLESKY_CONTRACTS;
    default:
      throw new Error(`Unknown chain ID: ${chainId}`);
  }
};

// Migration Claim contract addresses (to be updated after deployment)
// These are separate from the main staking contracts

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
