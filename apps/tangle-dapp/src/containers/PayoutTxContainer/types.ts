import { Payout } from '@webb-tools/tangle-shared-ui/types';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';

export type PayoutTxProps = {
  validatorAddress: SubstrateAddress;
  era: number;
};

export type PayoutTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  payoutTxProps: PayoutTxProps;
  payouts: Payout[];
};
