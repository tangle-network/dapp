import { Payout } from '../../types';

export type PayoutTxProps = {
  validatorAddress: string;
  era: number;
};

export type PayoutAllTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  validatorsAndEras: PayoutTxProps[];
  payouts: Payout[];
  updatePayouts: (payouts: Payout[]) => void;
};
