import { BN } from '@polkadot/util';

export type Validator = {
  address: string;
  identity?: string;
  totalValueStaked: BN;
  tokenSymbol: string;
  annualPercentageYield: number;
  commission: number;
};
