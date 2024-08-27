import { BN } from '@polkadot/util';

import { LsProtocolId } from '../constants/liquidStaking/types';

// All chains
export type StakingItem = {
  id: string; // address - Validator, contract address - DAPP, pool/vault ID - VaultOrStakePool
  totalValueStaked: BN;
  minimumStake?: BN;
  chainId: LsProtocolId;
  chainDecimals: number;
  chainTokenSymbol: string;
  itemType: LiquidStakingItem;
  href: string;
};

// Chains - Polkadot, Kusama, Tangle etc.
export type Validator = {
  validatorAddress: string;
  validatorIdentity: string;
  validatorCommission: BN;
  validatorAPY?: number;
} & StakingItem;

// Chain - Phala Network (Stake on Vaults or Stake Pools)
export type PhalaVaultOrStakePool = {
  vaultOrStakePoolID: string;
  vaultOrStakePoolName: string;
  vaultOrStakePoolAccountID: string;
  commission: BN;
  type: string;
} & StakingItem;

// Chain - Astar (dApp Staking)
export type Dapp = {
  dappContractAddress: string;
  dappName: string;
  dappContractType: string;
  commission: BN;
} & StakingItem;

// Chains - Moonbeam, Manta
export type Collator = {
  collatorAddress: string;
  collatorIdentity: string;
  collatorDelegationCount: number;
} & StakingItem;

export enum LiquidStakingItem {
  VALIDATOR = 'validator',
  VAULT_OR_STAKE_POOL = 'vaultOrStakePool',
  DAPP = 'dapp',
  COLLATOR = 'collator',
}

export type LiquidStakingItemType =
  | Validator
  | PhalaVaultOrStakePool
  | Dapp
  | Collator;

export enum LiquidStakingToken {
  DOT = 'DOT',
  GLMR = 'GLMR',
  MANTA = 'MANTA',
  ASTR = 'ASTR',
  PHA = 'PHA',
  TNT = 'TNT',
}
