import { BN, BN_ZERO } from '@polkadot/util';
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

import useNetworkStore from '../../../context/useNetworkStore';
import useRestakingLimits from '../../../data/restaking/useRestakingLimits';
import useApi from '../../../hooks/useApi';
import { RestakingService } from '../../../types';
import { formatTokenBalance } from '../../../utils/polkadot';
import { AllocationChartVariant } from '../AllocationChart';
import AllocationStepContainer from '../AllocationStepContainer';
import { RestakingAllocationMap } from '../types';
import IndependentAllocationInput from './IndependentAllocationInput';

export type IndependentAllocationStepProps = {
  allocations: RestakingAllocationMap;
  setAllocations: Dispatch<SetStateAction<RestakingAllocationMap>>;
};

export function filterAllocations(
  allocations: RestakingAllocationMap,
): [RestakingService, BN][] {
  return Object.entries(allocations).map(([serviceString, amount]) => {
    const service = z.nativeEnum(RestakingService).parse(serviceString);

    return [service, amount];
  });
}

const IndependentAllocationStep: FC<IndependentAllocationStepProps> = ({
  allocations,
  setAllocations,
}) => {
  const { maxRestakingAmount } = useRestakingLimits();
  const { nativeTokenSymbol } = useNetworkStore();

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

  const { result: maxRolesPerAccount } = useApi(
    useCallback((api) => api.consts.roles.maxRolesPerAccount, []),
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

  const amountRemaining = useMemo(
    () => maxRestakingAmount?.sub(restakedAmount) ?? null,
    [maxRestakingAmount, restakedAmount],
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
      Object.values(RestakingService).filter(
        (service) => !(service in allocations),
      ),
    [allocations],
  );

  const filteredAllocations = useMemo(
    () => filterAllocations(allocations),
    [allocations],
  );

  const canAddNewAllocation =
    availableRoles.length > 0 &&
    maxRolesPerAccount !== null &&
    maxRolesPerAccount.gtn(filteredAllocations.length);

  return (
    <AllocationStepContainer
      allocatedAmount={restakedAmount}
      allocations={allocations}
      variant={AllocationChartVariant.INDEPENDENT}
      previewAmount={newAllocationAmount ?? undefined}
      previewRole={newAllocationRole ?? undefined}
    >
      <div className="flex flex-col gap-4 items-start justify-start min-w-max">
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
              availableBalance={amountRemaining}
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
              availableBalance={amountRemaining}
              errorOnEmptyValue={false}
            />
          )}
        </div>

        <div className="w-full flex items-center justify-between gap-2">
          <Typography variant="body1" className="dark:text-mono-0">
            Remaining:{' '}
            {amountRemaining !== null
              ? formatTokenBalance(amountRemaining, nativeTokenSymbol)
              : '--'}
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
