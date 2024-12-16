import { BN, BN_ZERO } from '@polkadot/util';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import { EMPTY_VALUE_PLACEHOLDER } from '@webb-tools/webb-ui-components/constants';
import assert from 'assert';
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';

import { RestakingService } from '../../../types';
import AllocationStepContainer from '../AllocationStepContainer';
import { AllocationChartVariant, RestakingAllocationMap } from '../types';
import IndependentAllocationInput from './IndependentAllocationInput';
import { filterAllocations } from './utils';

export type IndependentAllocationStepProps = {
  allocations: RestakingAllocationMap;
  setAllocations: Dispatch<SetStateAction<RestakingAllocationMap>>;
};

const IndependentAllocationStep: FC<IndependentAllocationStepProps> = ({
  allocations,
  setAllocations,
}) => {
  const restakedAmount = useMemo(
    () =>
      Object.entries(allocations).reduce(
        (acc, [_key, amount]) => acc.add(amount),
        BN_ZERO,
      ),
    [allocations],
  );

  const [newAllocationAmount, setNewAllocationAmount] = useState<BN | null>(
    null,
  );

  const [newAllocationRole, setNewAllocationRole] =
    useState<RestakingService | null>(null);

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
    (service: RestakingService) => {
      const deallocatedAmount = allocations[service];

      assert(
        deallocatedAmount !== undefined,
        'Allocations should have an entry for the service being deallocated',
      );

      setAllocations((prev) => {
        const nextAllocations = Object.assign({}, prev);

        delete nextAllocations[service];

        return nextAllocations;
      });
    },
    [allocations, setAllocations],
  );

  const handleAllocationChange = useCallback(
    (service: RestakingService, newAmount: BN | null) => {
      // Do not update the amount if it has no value,
      // or if the new amount is the same as the current amount.
      if (newAmount === null || allocations[service]?.eq(newAmount)) {
        return;
      }

      setAllocations((prev) => ({
        ...prev,
        [service]: newAmount,
      }));
    },
    [allocations, setAllocations],
  );

  const isNewAllocationAmountValid = (() => {
    if (
      newAllocationRole === null ||
      newAllocationAmount === null ||
      newAllocationAmount.isZero()
    ) {
      return false;
    }

    return true;
  })();

  const availableRoles = useMemo(
    () =>
      Object.values(RestakingService).filter(
        (service) => !(service in allocations),
      ),
    [allocations],
  );

  const filteredAllocations = useMemo(
    () => filterAllocations(allocations),
    [allocations],
  );

  const canAddNewAllocation = availableRoles.length > 0;

  return (
    <AllocationStepContainer
      allocatedAmount={restakedAmount}
      allocations={allocations}
      variant={AllocationChartVariant.INDEPENDENT}
      previewAmount={newAllocationAmount ?? undefined}
      previewRole={newAllocationRole ?? undefined}
    >
      <div className="flex flex-col items-start justify-start gap-4 min-w-max">
        <div className="flex flex-col gap-4">
          {filteredAllocations.map(([service, amount]) => (
            <IndependentAllocationInput
              key={service}
              amount={amount}
              id={`manage-profile-allocation-${service}`}
              availableServices={availableRoles}
              service={service}
              setAmount={(newAmount) =>
                handleAllocationChange(service, newAmount)
              }
              onDelete={handleDeallocation}
              availableBalance={null}
              errorOnEmptyValue
            />
          ))}

          {canAddNewAllocation && (
            <IndependentAllocationInput
              id="manage-profile-new-allocation"
              availableServices={availableRoles}
              service={newAllocationRole}
              setService={setNewAllocationRole}
              amount={newAllocationAmount}
              setAmount={setNewAllocationAmount}
              availableBalance={null}
              errorOnEmptyValue={false}
            />
          )}
        </div>

        <div className="flex items-center justify-between w-full gap-2">
          <Typography variant="body1" className="dark:text-mono-0">
            Remaining: {EMPTY_VALUE_PLACEHOLDER}
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
    </AllocationStepContainer>
  );
};

export default IndependentAllocationStep;
