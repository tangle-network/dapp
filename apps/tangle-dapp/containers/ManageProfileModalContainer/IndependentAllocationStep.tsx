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

import useMaxRestakingAmount from '../../data/restaking/useMaxRestakingAmount';
import { ServiceType } from '../../types';
import { formatTokenBalance } from '../../utils/polkadot';
import AllocationChart, { AllocationChartVariant } from './AllocationChart';
import AllocationInput from './AllocationInput';
import { RestakingAllocationMap } from './types';

export type IndependentAllocationStepProps = {
  allocations: RestakingAllocationMap;
  setAllocations: Dispatch<SetStateAction<RestakingAllocationMap>>;
};

export function cleanAllocations(
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
  const maxRestakingAmount = useMaxRestakingAmount();

  const [newAllocationAmount, setNewAllocationAmount] = useState<BN | null>(
    null
  );

  const [newAllocationRole, setNewAllocationRole] =
    useState<ServiceType | null>(null);

  const restakedAmount = useMemo(() => {
    let amount = new BN(0);

    for (const [_service, serviceAmount] of Object.entries(allocations)) {
      if (serviceAmount !== null) {
        amount = amount.add(serviceAmount);
      }
    }

    return amount;
  }, [allocations]);

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
  }, [newAllocationAmount, newAllocationRole, setAllocations]);

  const handleClearAllocations = useCallback(() => {
    setAllocations({});
  }, [setAllocations]);

  const handleDeallocation = (service: ServiceType) => {
    const deallocatedAmount = allocations[service];

    assert(
      deallocatedAmount !== null,
      'Deallocated amount should not be null because that would imply that during its allocation, it had no amount set'
    );

    setAllocations((prev) => ({
      ...prev,
      [service]: null,
    }));
  };

  const amountRemaining = maxRestakingAmount?.sub(restakedAmount) ?? null;

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

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-5 items-center sm:items-start justify-center">
      <div className="flex flex-col gap-4 items-start justify-start min-w-max">
        <div className="flex flex-col gap-4">
          {cleanAllocations(allocations).map(([service, amount]) => (
            <AllocationInput
              amount={amount}
              isDisabled
              key={service}
              title="Total Restake"
              id={`manage-profile-allocation-${service}`}
              availableServices={availableRoles}
              service={service}
              setService={setNewAllocationRole}
              hasDeleteButton
              onDelete={handleDeallocation}
              availableBalance={amountRemaining}
              validateAmountAgainstRemaining={false}
            />
          ))}

          {availableRoles.length > 0 && (
            <AllocationInput
              title="Total Restake"
              id="manage-profile-new-allocation"
              availableServices={availableRoles}
              service={newAllocationRole}
              setService={setNewAllocationRole}
              amount={newAllocationAmount}
              onChange={setNewAllocationAmount}
              availableBalance={amountRemaining}
              validateAmountAgainstRemaining
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
            {restakedAmount.gtn(0) && (
              <Button
                size="sm"
                variant="utility"
                className="uppercase"
                onClick={handleClearAllocations}
              >
                Clear All
              </Button>
            )}

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

      <AllocationChart
        allocatedAmount={restakedAmount}
        allocations={allocations}
        variant={AllocationChartVariant.INDEPENDENT}
      />
    </div>
  );
};

export default IndependentAllocationStep;
