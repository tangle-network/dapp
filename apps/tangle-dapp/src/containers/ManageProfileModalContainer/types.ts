import { BN } from '@polkadot/util';
import Optional from '@webb-tools/tangle-shared-ui/utils/Optional';

import { RestakingProfileType, RestakingService } from '../../types';

export type ManageProfileModalContainerProps = {
  hasExistingProfile: boolean | null;
  profileTypeOpt: Optional<RestakingProfileType> | null;
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

export type RestakingAllocationMap = Partial<Record<RestakingService, BN>>;

export enum AllocationChartVariant {
  INDEPENDENT,
  SHARED,
}

/**
 * The steps in the manage profile modal.
 *
 * @remarks
 * The order of the steps is important, as it determines
 * the flow of the modal.
 */
export enum ManageProfileStep {
  CHOOSE_METHOD,
  ALLOCATION,
  CONFIRM_ALLOCATIONS,
}
