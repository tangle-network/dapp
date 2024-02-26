import { BN } from '@polkadot/util';
import {
  Button,
  SkeletonLoader,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { useTheme } from 'next-themes';
import { Dispatch, FC, SetStateAction, useState } from 'react';
import { Cell, Pie, PieChart, Tooltip as RechartsTooltip } from 'recharts';
import { z } from 'zod';

import { INDEPENDENT_CHART_COLORS } from '../../app/restake/RoleDistributionCard/IndependentChart';
import BnChartTooltip from '../../components/BnChartTooltip';
import { TANGLE_TOKEN_UNIT } from '../../constants';
import useBalances from '../../data/balances/useBalances';
import { ServiceType } from '../../types';
import convertToChainUnits from '../../utils/convertToChainUnits';
import { formatTokenBalance } from '../../utils/polkadot';
import AllocationInput from './AllocationInput';
import { RestakingAllocationMap } from './types';

function getPercentageOfTotal(amount: BN, total: BN): number {
  // Default to 100% if the total is 0, to avoid division by zero.
  if (total.isZero()) {
    return 1;
  }

  assert(amount.lte(total), 'Amount should be less than or equal to total');

  // It's safe to convert to a number here, since the
  // value will always be fraction between 0 and 1.
  return amount.mul(new BN(100)).div(total).toNumber() / 100;
}

type EntryName = 'Remaining' | ServiceType;

type RemainingThemeColor = '#3A3E53';

type AllocationDataEntry = {
  name: EntryName;
  value: number;
};

export type IndependentAllocationStepProps = {
  allocations: RestakingAllocationMap;
  setAllocations: Dispatch<SetStateAction<RestakingAllocationMap>>;
};

function getServiceChartColor(
  service: ServiceType
): (typeof INDEPENDENT_CHART_COLORS)[number] {
  switch (service) {
    case ServiceType.ZK_SAAS_MARLIN:
    case ServiceType.ZK_SAAS_GROTH16:
      return '#B8D6FF';
    case ServiceType.DKG_TSS_CGGMP:
      return '#E7E2FF';
    case ServiceType.TX_RELAY:
      return '#85DC8E';
  }
}

function getChartColor(
  entryName: EntryName
): RemainingThemeColor | (typeof INDEPENDENT_CHART_COLORS)[number] {
  switch (entryName) {
    case 'Remaining':
      return '#3A3E53';
    default:
      return getServiceChartColor(entryName);
  }
}

function cleanAllocations(
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
  const { transferrable: transferrableBalance } = useBalances();
  const themeProps = useTheme();

  const themeCellColor: RemainingThemeColor =
    themeProps.theme === 'dark' ? '#3A3E53' : '#3A3E53';

  const [newAllocationAmount, setNewAllocationAmount] = useState<BN | null>(
    null
  );

  const [newAllocationRole, setNewAllocationRole] =
    useState<ServiceType | null>(null);

  // TODO: Need to load initial restaked amount from Polkadot API. For now, it's hardcoded to 0. Will likely need a `useEffect` hook for this, since it requires an active account.
  const [restakedAmount, setRestakedAmount] = useState(new BN(0));

  const remainingDataEntry: AllocationDataEntry = {
    name: 'Remaining',
    value: getPercentageOfTotal(
      restakedAmount,
      transferrableBalance ?? new BN(0)
    ),
  };

  const allocationDataEntries: AllocationDataEntry[] = cleanAllocations(
    allocations
  ).map(([service, amount]) => ({
    name: service,
    // TODO: Fix bug: Result is `1`. Perhaps the amount isn't being converted to chain units properly?
    value: getPercentageOfTotal(amount, restakedAmount),
  }));

  const data = [remainingDataEntry].concat(allocationDataEntries);
  const amountRemaining = transferrableBalance?.sub(restakedAmount) ?? null;

  const handleNewAllocation = () => {
    if (newAllocationRole === null || newAllocationAmount === null) {
      return;
    }

    setAllocations((prev) => ({
      ...prev,
      [newAllocationRole]: newAllocationAmount,
    }));

    setRestakedAmount((restakedAmount) =>
      restakedAmount.add(newAllocationAmount)
    );

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

    setRestakedAmount(convertToChainUnits(0));
  };

  const handleDeallocation = (service: ServiceType) => {
    const deallocatedAmount = allocations[service];

    assert(
      deallocatedAmount !== null,
      'Deallocated amount should not be null because that would imply that during its allocation, it had no amount set'
    );

    setRestakedAmount((restakedAmount) =>
      restakedAmount.sub(deallocatedAmount)
    );

    setAllocations((prev) => ({
      ...prev,
      [service]: null,
    }));
  };

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
    <div className="flex gap-5 items-start justify-center">
      <div className="flex flex-col gap-4 items-end justify-start min-w-max">
        <div className="flex flex-col gap-4">
          {cleanAllocations(allocations).map(([service, amount]) => (
            <AllocationInput
              amount={amount}
              isDisabled
              key={service}
              title="Total Restake"
              id={`manage-profile-allocation-${service}`}
              availableRoles={availableRoles}
              service={service as ServiceType}
              setRole={setNewAllocationRole}
              hasDeleteButton
              onDelete={handleDeallocation}
            />
          ))}

          {availableRoles.length > 0 && (
            <AllocationInput
              title="Total Restake"
              id="manage-profile-new-allocation"
              availableRoles={availableRoles}
              service={newAllocationRole}
              setRole={setNewAllocationRole}
              amount={newAllocationAmount}
              onChange={setNewAllocationAmount}
            />
          )}
        </div>

        <div className="flex gap-2">
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
              Add Allocation
            </Button>
          )}
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
              transferrableBalance ?? new BN(0),
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
