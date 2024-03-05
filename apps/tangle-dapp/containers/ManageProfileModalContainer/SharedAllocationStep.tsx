import { BN } from '@polkadot/util';
import { Dispatch, FC, SetStateAction, useState } from 'react';

import { ServiceType } from '../../types';
import AllocationChart, { AllocationChartVariant } from './AllocationChart';
import AmountInput from './AmountInput';
import RolesInput from './RolesInput';
import { RestakingAllocationMap } from './types';

export type SharedAllocationStepProps = {
  allocations: RestakingAllocationMap;
  setAllocations: Dispatch<SetStateAction<RestakingAllocationMap>>;
};

const SharedAllocationStep: FC<SharedAllocationStepProps> = () => {
  const [restakeAmount, setRestakeAmount] = useState<BN | null>(null);

  const [selectedRoles, setSelectedRoles] = useState<ServiceType[]>([
    ServiceType.TX_RELAY,
    ServiceType.ZK_SAAS_GROTH16,
  ]);

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

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-5 items-center sm:items-start justify-center">
      <div className="flex flex-col gap-4 min-w-max">
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
      </div>

      <AllocationChart
        allocatedAmount={restakeAmount ?? new BN(0)}
        allocations={{}}
        variant={AllocationChartVariant.Shared}
      />
    </div>
  );
};

export default SharedAllocationStep;
