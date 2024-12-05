import { BN } from '@polkadot/util';
import { Dispatch, FC, SetStateAction } from 'react';

import { RestakingProfileType } from '../../types';
import ChooseMethodStep from './ChooseMethodStep';
import ConfirmAllocationsStep from './ConfirmAllocationsStep';
import IndependentAllocationStep from './Independent/IndependentAllocationStep';
import { ManageProfileStep } from './ManageProfileModalContainer';
import SharedAllocationStep from './Shared/SharedAllocationStep';
import { RestakingAllocationMap } from './types';

export type AllocationStepProps = {
  allocations: RestakingAllocationMap;
  step: ManageProfileStep;
  profileType: RestakingProfileType;
  sharedRestakeAmount: BN | null;
  setSharedRestakeAmount: Dispatch<SetStateAction<BN | null>>;
  setAllocations: (newAllocations: RestakingAllocationMap) => void;
  setAllocationsDispatch: Dispatch<SetStateAction<RestakingAllocationMap>>;
  setProfileType: (newProfileType: RestakingProfileType) => void;
};

const AllocationStep: FC<AllocationStepProps> = ({
  step,
  profileType,
  allocations,
  sharedRestakeAmount,
  setSharedRestakeAmount,
  setAllocations,
  setAllocationsDispatch,
  setProfileType,
}) => {
  switch (step) {
    case ManageProfileStep.CHOOSE_METHOD:
      return (
        <ChooseMethodStep
          profileType={profileType}
          setProfileType={setProfileType}
        />
      );
    case ManageProfileStep.ALLOCATION:
      return profileType === RestakingProfileType.INDEPENDENT ? (
        <IndependentAllocationStep
          allocations={allocations}
          setAllocations={setAllocationsDispatch}
        />
      ) : (
        <SharedAllocationStep
          restakeAmount={sharedRestakeAmount}
          setRestakeAmount={setSharedRestakeAmount}
          allocations={allocations}
          setAllocations={setAllocations}
        />
      );
    case ManageProfileStep.CONFIRM_ALLOCATIONS:
      return (
        <ConfirmAllocationsStep
          profileType={profileType}
          allocations={allocations}
          sharedRestakeAmount={sharedRestakeAmount ?? undefined}
        />
      );
  }
};

export default AllocationStep;
