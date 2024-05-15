import { Payout } from '../../types';

export type PayoutTxProps = {
  validatorAddress: string;
  era: number;
};

export type PayoutTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  payoutTxProps: PayoutTxProps;
  payouts: Payout[];
  updatePayouts: (payouts: Payout[]) => void;
};
