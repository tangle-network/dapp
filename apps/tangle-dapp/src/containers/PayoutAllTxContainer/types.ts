import { Payout } from '@webb-tools/tangle-shared-ui/types';

export type PayoutTxProps = {
  validatorSubstrateAddress: string;
  era: number;
};

export type PayoutAllTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  validatorsAndEras: PayoutTxProps[];
  payouts: Payout[];
  onComplete: () => void;
};
