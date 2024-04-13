import {
  StakingRewardsDestination,
  StakingRewardsDestinationDisplayText,
} from '../../types';

export type UpdatePayeeTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

export type UpdatePayeeProps = {
  currentPayee: string | number;
  payeeOptions: StakingRewardsDestinationDisplayText[];
  payee: StakingRewardsDestination;
  setPayee: (newPayee: StakingRewardsDestination) => void;
};
