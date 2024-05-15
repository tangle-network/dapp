import {
  StakingRewardsDestination,
  StakingRewardsDestinationDisplayText,
} from '../../types';
import Optional from '../../utils/Optional';

export type UpdatePayeeTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

export type UpdatePayeeProps = {
  currentPayee: Optional<StakingRewardsDestination> | null;
  payeeOptions: StakingRewardsDestinationDisplayText[];
  selectedPayee: StakingRewardsDestination;
  setSelectedPayee: (newPayee: StakingRewardsDestination) => void;
};
