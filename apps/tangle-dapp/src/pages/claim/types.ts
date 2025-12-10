import BN from 'bn.js';

export type ClaimInfoType = {
  totalAmount: BN;
  vestingAmount: BN;
  isRegularStatement: boolean;
};
