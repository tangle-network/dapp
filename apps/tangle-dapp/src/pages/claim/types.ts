import { BN } from '@polkadot/util';

export type ClaimInfoType = {
  totalAmount: BN;
  vestingAmount: BN;
  isRegularStatement: boolean;
};
