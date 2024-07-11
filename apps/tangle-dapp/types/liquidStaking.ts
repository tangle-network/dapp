import { BN } from '@polkadot/util';

// All chains
export type StakingItem = {
  id: string;
  totalValueStaked: BN;
  chain: string;
  chainDecimals: number;
  chainTokenSymbol: string;
};

// Chains - Polkadot, Kusama, Tangle etc.
export type Validator = {
  validatorAddress: string;
  validatorIdentity: string;
  validatorCommission: BN;
  validatorAPY?: number;
} & StakingItem;

// Chain - Phala Network (Stake on Vaults or Stake Pools)
export type VaultOrStakePool = {
  type: 'vault' | 'stakePool';
} & StakingItem;

// Chain - Astar (dApp Staking)
export type Dapp = {
  dappContractAddress: string;
} & StakingItem;

export enum LiquidStakingItem {
  VALIDATOR = 'validator',
  VAULT_OR_STAKE_POOL = 'vaultOrStakePool',
  DAPP = 'dapp',
}
