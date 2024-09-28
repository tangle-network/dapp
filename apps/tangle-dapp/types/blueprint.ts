import { BasicAccountInfo } from '.';
import { LiquidStakingToken } from './liquidStaking';

export type Blueprint = {
  id: string;
  name: string;
  author: string;
  imgUrl: string | null;
  category: string | null;
  description: string | null;
  restakersCount: number | null;
  operatorsCount: number | null;
  tvl: string | null;
  isBoosted?: boolean;
  githubUrl?: string | null;
  websiteUrl?: string | null;
  twitterUrl?: string | null;
  email?: string | null;
};

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
  assets: Asset[];
};

export type Asset = {
  id: string;
  symbol: string;
  tvl: number; // NOTE: put as number for faster UI development, might need to update later
  myStake: number; // NOTE: put as number for faster UI development, might need to update later
};
