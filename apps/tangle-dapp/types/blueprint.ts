import { BasicAccountInfo } from '.';
import { LiquidStakingToken } from './liquidStaking';

export type Blueprint = {
  id: string;
  name: string;
  author: string;
  imgUrl: string;
  category: BlueprintCategory;
  description: string;
  restakersCount: number;
  operatorsCount: number;
  tvl: string; // NOTE: put as string for faster UI development, might need to update later
  isBoosted?: boolean;
  githubUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  email?: string;
};

export enum BlueprintCategory {
  CATEGORY_1 = 'Category 1',
  CATEGORY_2 = 'Category 2',
  CATEGORY_3 = 'Category 3',
}

export type Operator = BasicAccountInfo & {
  restakersCount: number;
  concentration: number;
  liquidity: {
    amount: number; // NOTE: put as number for faster UI development, might need to update later
    usdValue: number; // NOTE: put as number for faster UI development, might need to update later
  };
  vaults: LiquidStakingToken[];
};

export type Vault = {
  lstToken: LiquidStakingToken;
  name: string;
  apy: number;
  tokensCount: number;
  liquidity: {
    amount: number; // NOTE: put as number for faster UI development, might need to update later
    usdValue: number; // NOTE: put as number for faster UI development, might need to update later
  };
};

export type VaultAsset = {
  id: string;
  symbol: string;
  tvl: number; // NOTE: put as number for faster UI development, might need to update later
  myStake: number; // NOTE: put as number for faster UI development, might need to update later
};
