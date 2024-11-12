import { Payout } from '@webb-tools/tangle-shared-ui/types';

export type PayoutTxProps = {
  validatorAddress: string;
  era: number;
};

export type PayoutTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  payoutTxProps: PayoutTxProps;
  payouts: Payout[];
};
