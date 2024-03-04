import { BN } from '@polkadot/util';
import {
  Button,
  Typography,
  useNextDarkMode,
} from '@webb-tools/webb-ui-components';
import assert from 'assert';
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { Cell, Pie, PieChart, Tooltip as RechartsTooltip } from 'recharts';
import { z } from 'zod';

import BnChartTooltip from '../../components/BnChartTooltip';
import { ChartColor, TANGLE_TOKEN_UNIT } from '../../constants';
import useStakingLedgerRx from '../../hooks/useStakingLedgerRx';
import { ServiceType } from '../../types';
import { formatTokenBalance } from '../../utils/polkadot';
import AllocationInput from './AllocationInput';
import { RestakingAllocationMap } from './types';

type EntryName = 'Remaining' | ServiceType;

type AllocationDataEntry = {
  name: EntryName;
  value: number;
};

export type IndependentAllocationStepProps = {
  allocations: RestakingAllocationMap;
  setAllocations: Dispatch<SetStateAction<RestakingAllocationMap>>;
};

function getPercentageOfTotal(amount: BN, total: BN): number {
  // Avoid division by zero.
  if (total.isZero()) {
    throw new Error('Total should not be zero');
  }

  assert(amount.lte(total), 'Amount should be less than or equal to total');

  // It's safe to convert to a number here, since the
  // value will always be fraction between 0 and 1.
  return amount.mul(new BN(100)).div(total).toNumber() / 100;
}

function getServiceChartColor(service: ServiceType): ChartColor {
  switch (service) {
    case ServiceType.ZK_SAAS_MARLIN:
    case ServiceType.ZK_SAAS_GROTH16:
      return ChartColor.Blue;
    case ServiceType.DKG_TSS_CGGMP:
      return ChartColor.Lavender;
    case ServiceType.TX_RELAY:
      return ChartColor.Green;
  }
}

function getChartColor(entryName: EntryName): ChartColor {
  switch (entryName) {
    case 'Remaining':
      return ChartColor.DarkGray;
    default:
      return getServiceChartColor(entryName);
  }
}

export function cleanAllocations(
  allocations: RestakingAllocationMap
): [ServiceType, BN][] {
  return Object.entries(allocations)
    .filter(([_service, amount]) => amount !== null)
    .map(([serviceString, amount]) => {
      const service = z.nativeEnum(ServiceType).parse(serviceString);

      assert(
        amount !== null,
        'Entries without amounts should have been filtered out'
      );

      return [service, amount];
    });
}

const IndependentAllocationStep: FC<IndependentAllocationStepProps> = ({
  allocations,
  setAllocations,
}) => {
  const { data: stakedBalance } = useStakingLedgerRx(
    useCallback((ledger) => ledger.total.toBn(), [])
  );

  // Max restaking amount = 50% of the total staked balance, which
  // is equivalent to dividing the staked balance by 2. This is taken
  // from Tangle's source code, as it seems that it is not obtainable
  // from the Polkadot API.
  // See: https://github.com/webb-tools/tangle/blob/8be20aa02a764422e1fd0ba30bc70b99d5f66887/runtime/mainnet/src/lib.rs#L1137
  const maxRestakingAmount = stakedBalance?.divn(2) ?? null;

  const [isDarkMode] = useNextDarkMode();

  const themeCellColor: ChartColor = isDarkMode
    ? ChartColor.DarkGray
    : ChartColor.Gray;

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

  const remainingDataEntry: AllocationDataEntry = {
    name: 'Remaining',
    value:
      maxRestakingAmount === null
        ? 1
        : 1 - getPercentageOfTotal(restakedAmount, maxRestakingAmount),
  };

  const allocationDataEntries: AllocationDataEntry[] = cleanAllocations(
    allocations
  ).map(([service, amount]) => ({
    name: service,
    value:
      maxRestakingAmount === null
        ? 0
        : getPercentageOfTotal(amount, maxRestakingAmount),
  }));

  const data = [remainingDataEntry].concat(allocationDataEntries);

  const handleNewAllocation = () => {
    if (newAllocationRole === null || newAllocationAmount === null) {
      return;
    }

    setAllocations((prev) => ({
      ...prev,
      [newAllocationRole]: newAllocationAmount,
    }));

    setNewAllocationRole(null);
    setNewAllocationAmount(null);
  };

  const handleClearAllocations = () => {
    setAllocations({
      [ServiceType.DKG_TSS_CGGMP]: null,
      [ServiceType.TX_RELAY]: null,
      [ServiceType.ZK_SAAS_GROTH16]: null,
      [ServiceType.ZK_SAAS_MARLIN]: null,
    });
  };

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

  const availableRoles = Object.entries(allocations)
    .filter((entry) => entry[1] === null)
    .map(([service]) => z.nativeEnum(ServiceType).parse(service));

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

      <div className="relative flex items-center justify-center w-full">
        <PieChart width={190} height={190}>
          <Pie
            data={data}
            innerRadius={65}
            outerRadius={95}
            stroke="none"
            dataKey="value"
            paddingAngle={5}
            animationDuration={200}
          >
            <Cell key="Remaining" fill={themeCellColor} />

            {allocationDataEntries.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getChartColor(entry.name)} />
            ))}
          </Pie>

          <RechartsTooltip
            content={BnChartTooltip(
              allocations,
              maxRestakingAmount ?? new BN(0),
              restakedAmount
            )}
          />
        </PieChart>

        <div className="absolute center flex flex-col justify-center items-center z-[-1]">
          <Typography
            variant="body2"
            fw="normal"
            className="dark:text-mono-120"
          >
            Restaked
          </Typography>

          <Typography
            variant="h5"
            fw="bold"
            className="dark:text-mono-0 text-center"
          >
            {formatTokenBalance(restakedAmount, false)}
          </Typography>

          <Typography variant="body2" className="dark:text-mono-120">
            {TANGLE_TOKEN_UNIT}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default IndependentAllocationStep;
