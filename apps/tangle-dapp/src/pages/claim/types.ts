import { BN } from '@tangle-network/tangle-shared-ui/bn';

export type ClaimInfoType = {
  totalAmount: BN;
  vestingAmount: BN;
  isRegularStatement: boolean;
};
