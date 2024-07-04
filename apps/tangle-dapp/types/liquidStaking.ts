import { BN } from '@polkadot/util';

export type Validator = {
  address: string;
  identity: string;
  totalValueStaked: BN;
  annualPercentageYield: number;
  commission: BN;
  chain: string;
  chainDecimals: number;
  tokenSymbol: string;
};

export type Collator = {
  address: string;
  identity: string;
  // totalValueStaked: BN;
  chain: string;
  chainDecimals: number;
  tokenSymbol: string;
};
