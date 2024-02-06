import { Payout } from '../../types';

export type PayoutTxProps = {
  validatorAddress: string;
  era: string;
};

export type PayoutTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  payoutTxProps: PayoutTxProps;
  payouts: Payout[];
  updatePayouts: (payouts: Payout[]) => void;
};
