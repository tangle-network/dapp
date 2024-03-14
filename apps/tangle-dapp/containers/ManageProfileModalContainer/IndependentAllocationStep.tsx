import { BN } from '@polkadot/util';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { z } from 'zod';

import useRestakingLimits from '../../data/restaking/useRestakingLimits';
import usePolkadotApi from '../../hooks/usePolkadotApi';
import { ServiceType } from '../../types';
import { formatTokenBalance } from '../../utils/polkadot';
import { AllocationChartVariant } from './AllocationChart';
import AllocationInput from './AllocationInput';
import AllocationStepContents from './AllocationStepContents';
import { RestakingAllocationMap } from './types';

export type IndependentAllocationStepProps = {
  allocations: RestakingAllocationMap;
  setAllocations: Dispatch<SetStateAction<RestakingAllocationMap>>;
};

export function filterAllocations(
  allocations: RestakingAllocationMap
): [ServiceType, BN][] {
  return Object.entries(allocations).map(([serviceString, amount]) => {
    const service = z.nativeEnum(ServiceType).parse(serviceString);

    return [service, amount];
  });
}

const IndependentAllocationStep: FC<IndependentAllocationStepProps> = ({
  allocations,
  setAllocations,
}) => {
  const { maxRestakingAmount } = useRestakingLimits();

  const restakedAmount = useMemo(() => {
    let amount = new BN(0);

    for (const [_service, serviceAmount] of Object.entries(allocations)) {
      if (serviceAmount !== null) {
        amount = amount.add(serviceAmount);
      }
    }

    return amount;
  }, [allocations]);

  const [newAllocationAmount, setNewAllocationAmount] = useState<BN | null>(
    null
  );

  const { value: maxRolesPerAccount } = usePolkadotApi(
    useCallback(
      (api) => Promise.resolve(api.consts.roles.maxRolesPerAccount),
      []
    )
  );

  const [newAllocationRole, setNewAllocationRole] =
    useState<ServiceType | null>(null);

  const handleNewAllocation = useCallback(() => {
    if (newAllocationRole === null || newAllocationAmount === null) {
      return;
    }

    setAllocations((prev) => ({
      ...prev,
      [newAllocationRole]: newAllocationAmount,
    }));

    setNewAllocationRole(null);
    setNewAllocationAmount(null);
  }, [
    newAllocationAmount,
    newAllocationRole,
    setAllocations,
    setNewAllocationAmount,
  ]);

  const handleDeallocation = useCallback(
    (service: ServiceType) => {
      const deallocatedAmount = allocations[service];

      assert(
        deallocatedAmount !== undefined,
        'Allocations should have an entry for the service being deallocated'
      );

      setAllocations((prev) => {
        const nextAllocations = Object.assign({}, prev);

        delete nextAllocations[service];

        return nextAllocations;
      });
    },
    [allocations, setAllocations]
  );

  const handleAllocationChange = (service: ServiceType, newAmount: BN) => {
    setAllocations((prev) => ({
      ...prev,
      [service]: newAmount,
    }));
  };

  const amountRemaining = useMemo(
    () => maxRestakingAmount?.sub(restakedAmount) ?? null,
    [maxRestakingAmount, restakedAmount]
  );

  const isNewAllocationAmountValid = (() => {
    if (
      newAllocationRole === null ||
      newAllocationAmount === null ||
      newAllocationAmount.isZero() ||
      amountRemaining === null ||
      amountRemaining.isZero()
    ) {
      return false;
    }

    return newAllocationAmount.lte(amountRemaining);
  })();

  const availableRoles = useMemo(
    () =>
      Object.values(ServiceType).filter((service) => !(service in allocations)),
    [allocations]
  );

  const filteredAllocations = useMemo(
    () => filterAllocations(allocations),
    [allocations]
  );

  const canAddNewAllocation =
    availableRoles.length > 0 &&
    maxRolesPerAccount !== null &&
    maxRolesPerAccount.gtn(filteredAllocations.length);

  return (
    <AllocationStepContents
      allocatedAmount={restakedAmount}
      allocations={allocations}
      variant={AllocationChartVariant.INDEPENDENT}
      previewAmount={newAllocationAmount ?? undefined}
      previewRole={newAllocationRole ?? undefined}
    >
      <div className="flex flex-col gap-4 items-start justify-start min-w-max">
        <div className="flex flex-col gap-4">
          {filteredAllocations.map(([service, amount]) => (
            <AllocationInput
              key={service}
              amount={amount}
              id={`manage-profile-allocation-${service}`}
              availableServices={availableRoles}
              service={service}
              setAmount={(newAmount) =>
                handleAllocationChange(service, newAmount)
              }
              onDelete={handleDeallocation}
              availableBalance={amountRemaining}
              errorOnEmptyValue
            />
          ))}

          {canAddNewAllocation && (
            <AllocationInput
              id="manage-profile-new-allocation"
              availableServices={availableRoles}
              service={newAllocationRole}
              setService={setNewAllocationRole}
              amount={newAllocationAmount}
              setAmount={setNewAllocationAmount}
              availableBalance={amountRemaining}
              errorOnEmptyValue={false}
            />
          )}
        </div>

        <div className="w-full flex items-center justify-between gap-2">
          <Typography variant="body1" className="dark:text-mono-0">
            Remaining:{' '}
            {amountRemaining !== null
              ? formatTokenBalance(amountRemaining)
              : '—'}
          </Typography>

          <div className="flex items-center gap-2">
            {availableRoles.length > 0 && (
              <Button
                size="sm"
                variant="utility"
                className="uppercase"
                onClick={handleNewAllocation}
                isDisabled={!isNewAllocationAmountValid}
              >
                Add Role
              </Button>
            )}
          </div>
        </div>
      </div>
    </AllocationStepContents>
  );
};

export default IndependentAllocationStep;
