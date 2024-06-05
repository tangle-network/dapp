import {
  StakingRewardsDestination,
  StakingRewardsDestinationDisplayText,
} from '../../types';

export type UpdatePayeeTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

export type UpdatePayeeProps = {
  payeeOptions: StakingRewardsDestinationDisplayText[];
  selectedPayee: StakingRewardsDestination;
  setSelectedPayee: (newPayee: StakingRewardsDestination) => void;
};
