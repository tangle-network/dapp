export enum LiquidStakingToken {
  DOT = 'DOT',
  GLMR = 'GLMR',
  MANTA = 'MANTA',
  ASTR = 'ASTR',
  PHA = 'PHA',
  TNT = 'TNT',
}

export type Vault = {
  lstToken: LiquidStakingToken;
  name: string;
  tvl: {
    value: number; // NOTE: put as number for faster UI development, might need to update later
    valueInUSD: number; // NOTE: put as number for faster UI development, might need to update later
  };
  derivativeTokens: number;
  myStake: {
    value: number; // NOTE: put as number for faster UI development, might need to update later
    valueInUSD: number; // NOTE: put as number for faster UI development, might need to update later
  };
  assets: Asset[];
};

export type Asset = {
  id: string;
  token: string;
  tvl: number; // NOTE: put as number for faster UI development, might need to update later
  apy: number; // NOTE: put as number for faster UI development, might need to update later
  myStake: number; // NOTE: put as number for faster UI development, might need to update later
};
