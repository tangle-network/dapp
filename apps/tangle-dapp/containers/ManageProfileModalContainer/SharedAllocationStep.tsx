import { BN } from '@polkadot/util';
import { Typography } from '@webb-tools/webb-ui-components';
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';

import useRestakingLimits from '../../data/restaking/useRestakingLimits';
import { ServiceType } from '../../types';
import { formatTokenBalance } from '../../utils/polkadot';
import { AllocationChartVariant } from './AllocationChart';
import AllocationStepContents from './AllocationStepContents';
import AmountInput from './AmountInput';
import RolesInput from './RolesInput';
import { RestakingAllocationMap } from './types';

export type SharedAllocationStepProps = {
  restakeAmount: BN | null;
  setRestakeAmount: Dispatch<SetStateAction<BN | null>>;
  allocations: RestakingAllocationMap;
  setAllocations: Dispatch<SetStateAction<RestakingAllocationMap>>;
};

const SharedAllocationStep: FC<SharedAllocationStepProps> = ({
  allocations,
  setAllocations,
  restakeAmount,
  setRestakeAmount,
}) => {
  const { maxRestakingAmount } = useRestakingLimits();

  const remainingAmount =
    maxRestakingAmount?.sub(restakeAmount ?? new BN(0)) ?? null;

  const [selectedRoles, setSelectedRoles] = useState<ServiceType[]>([]);

  const handleToggleRole = (role: ServiceType) => {
    const isSelected = selectedRoles.includes(role);

    if (isSelected) {
      setSelectedRoles((roles) =>
        roles.filter((selectedRole) => selectedRole !== role)
      );
    } else {
      setSelectedRoles((roles) => [...roles, role]);
    }
  };

  // Update allocations when the selected roles changes.
  useEffect(() => {
    const nextAllocations: RestakingAllocationMap = {};

    // Shared roles profile allocations have their amounts
    // set to `null`.
    for (const selectedRole of selectedRoles) {
      nextAllocations[selectedRole] = null;
    }

    setAllocations(nextAllocations);
  }, [selectedRoles, setAllocations]);

  return (
    <AllocationStepContents
      allocatedAmount={restakeAmount ?? new BN(0)}
      allocations={allocations}
      variant={AllocationChartVariant.SHARED}
    >
      <AmountInput
        id="shared-allocation-amount"
        title="Total Restake"
        amount={restakeAmount}
        setAmount={setRestakeAmount}
      />

      <RolesInput
        id="shared-allocation-roles-opt-in"
        title="Roles Opt-in"
        roles={Object.values(ServiceType)}
        selectedRoles={selectedRoles}
        onToggleRole={handleToggleRole}
      />

      <Typography variant="body1" fw="normal" className="self-start">
        Remaining:{' '}
        {remainingAmount !== null ? formatTokenBalance(remainingAmount) : '—'}
      </Typography>
    </AllocationStepContents>
  );
};

export default SharedAllocationStep;
