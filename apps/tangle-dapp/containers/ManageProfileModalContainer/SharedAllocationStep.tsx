import { BN } from '@polkadot/util';
import { Typography } from '@webb-tools/webb-ui-components';
import { FC, useCallback, useEffect, useState } from 'react';

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
  setRestakeAmount: (newAmount: BN | null) => void;
  allocations: RestakingAllocationMap;
  setAllocations: (newAllocations: RestakingAllocationMap) => void;
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

  const [selectedRoles, setSelectedRoles] = useState<ServiceType[]>(
    Object.keys(allocations) as ServiceType[]
  );

  const handleToggleRole = useCallback(
    (role: ServiceType) => {
      const isSelected = selectedRoles.includes(role);

      if (isSelected) {
        setSelectedRoles((roles) =>
          roles.filter((selectedRole) => selectedRole !== role)
        );
      } else {
        setSelectedRoles((roles) => [...roles, role]);
      }
    },
    [selectedRoles]
  );

  // Update allocations when the selected roles changes.
  useEffect(() => {
    const nextAllocations: RestakingAllocationMap = {};

    // Shared roles profile allocations have their amounts
    // set to zero.
    for (const selectedRole of selectedRoles) {
      nextAllocations[selectedRole] = new BN(0);
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
        amount={restakeAmount ?? new BN(0)}
        setAmount={setRestakeAmount}
      />

      <RolesInput
        id="shared-allocation-roles-opt-in"
        title="Roles Opt-in"
        services={Object.values(ServiceType)}
        selectedServices={selectedRoles}
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
