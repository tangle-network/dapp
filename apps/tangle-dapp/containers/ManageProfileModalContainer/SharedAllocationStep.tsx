import { BN } from '@polkadot/util';
import { Dispatch, FC, SetStateAction, useState } from 'react';

import { ServiceType } from '../../types';
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
    <div className="flex flex-col gap-4">
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
  );
};

export default SharedAllocationStep;
