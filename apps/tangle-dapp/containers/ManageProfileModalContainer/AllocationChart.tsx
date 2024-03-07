import { BN } from '@polkadot/util';
import { Typography, useNextDarkMode } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { FC, useMemo } from 'react';
import {
  Cell,
  Pie,
  PieChart,
  PieProps,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';

import BnChartTooltip from '../../components/BnChartTooltip';
import { ChartColor, TANGLE_TOKEN_UNIT } from '../../constants';
import useRestakingLimits from '../../data/restaking/useRestakingLimits';
import { ServiceType } from '../../types';
import { getChartDataAreaColorByServiceType } from '../../utils';
import { formatTokenBalance } from '../../utils/polkadot';
import { filterAllocations } from './IndependentAllocationStep';
import { RestakingAllocationMap } from './types';

export enum AllocationChartVariant {
  INDEPENDENT,
  SHARED,
}

export type AllocationChartProps = {
  variant: AllocationChartVariant;
  allocations: RestakingAllocationMap;
  allocatedAmount: BN;
};

export type EntryName = 'Remaining' | ServiceType;

export type AllocationDataEntry = {
  name: EntryName;
  value: number;
};

/**
 * Given an amount, calculate its percentage of a total amount.
 *
 * The resulting percentage will be a Number with 2 decimal places,
 * ex. `0.67`, ranging from 0 to 1.
 *
 * This is useful for integrating BN numbers into visual representation,
 * such as when working with Recharts to chart BN amount allocations,
 * since Recharts does not natively support BNs as data inputs.
 *
 * Because of the possible loss in precision, this utility function is
 * only suitable for use in the UI.
 */
function getPercentageOfTotal(amount: BN, total: BN): number {
  assert(
    !total.isZero(),
    'Total should not be zero, otherwise division by zero would occur'
  );

  assert(amount.lte(total), 'Amount should be less than or equal to total');

  const scaledAmount = amount.mul(new BN(100));
  const percentageString = scaledAmount.div(total).toString();

  // Converting the string to a number ensures that the conversion to
  // number never fails, but it may result in a loss of precision for
  // extremely large values.
  const percentage = Number(percentageString) / 100;

  // Round the percentage to 2 decimal places. It's suitable to use
  // 2 decimal places since the purpose of this function is to provide
  // a visual representation of the percentage in the UI.
  return Math.round(percentage * 100) / 100;
}

function getChartColorOfEntryName(entryName: EntryName): ChartColor {
  switch (entryName) {
    case 'Remaining':
      return ChartColor.DARK_GRAY;
    default:
      return getChartDataAreaColorByServiceType(entryName);
  }
}

const AllocationChart: FC<AllocationChartProps> = ({
  allocatedAmount,
  allocations,
  variant,
}) => {
  const [isDarkMode] = useNextDarkMode();
  const { maxRestakingAmount } = useRestakingLimits();

  const themeCellColor: ChartColor = isDarkMode
    ? ChartColor.DARK_GRAY
    : ChartColor.GRAY;

  const remainingDataEntry: AllocationDataEntry = useMemo(
    () => ({
      name: 'Remaining',
      value:
        maxRestakingAmount === null
          ? 1
          : 1 - getPercentageOfTotal(allocatedAmount, maxRestakingAmount),
    }),
    [maxRestakingAmount, allocatedAmount]
  );

  const allocationDataEntries: AllocationDataEntry[] = useMemo(
    () =>
      filterAllocations(allocations).map(([service, amount]) => ({
        name: service,
        value:
          maxRestakingAmount === null
            ? 0
            : getPercentageOfTotal(amount ?? new BN(0), maxRestakingAmount),
      })),
    [allocations, maxRestakingAmount]
  );

  // For the independent variant, use both the remaining data
  // entry, and the allocations. For the shared variant, use
  // either: If no allocations, show the remaining balance,
  // otherwise use the allocations as data entries.
  const data: AllocationDataEntry[] =
    variant === AllocationChartVariant.INDEPENDENT
      ? [remainingDataEntry].concat(allocationDataEntries)
      : allocationDataEntries.length === 0
      ? [{ name: 'Remaining', value: 1 }]
      : allocationDataEntries.map(({ name }) => ({
          name,
          // Use a value of `1` so that Recharts shows the bar.
          // This value doesn't matter much, since shared profiles
          // do not set their amounts per-role, but rather as a whole.
          value: 1,
        }));

  const tooltip = (
    <RechartsTooltip
      content={BnChartTooltip(
        allocations,
        maxRestakingAmount ?? new BN(0),
        allocatedAmount,
        variant === AllocationChartVariant.INDEPENDENT
      )}
    />
  );

  const cells = (
    <>
      {(variant === AllocationChartVariant.INDEPENDENT ||
        allocationDataEntries.length === 0) && (
        <Cell key="remaining" fill={themeCellColor} />
      )}

      {allocationDataEntries.map((entry) => (
        <Cell key={entry.name} fill={getChartColorOfEntryName(entry.name)} />
      ))}
    </>
  );

  const sharedChartProps = {
    data,
    stroke: 'none',
    dataKey: 'value',
  } satisfies PieProps;

  return (
    <div className="relative flex items-center justify-center">
      <div className="w-full h-[220px]">
        <ResponsiveContainer>
          {variant === AllocationChartVariant.INDEPENDENT ? (
            <PieChart>
              <Pie
                innerRadius="70%"
                outerRadius="100%"
                paddingAngle={5}
                animationDuration={200}
                cornerRadius={8}
                {...sharedChartProps}
              >
                {cells}
              </Pie>

              {tooltip}
            </PieChart>
          ) : (
            <RadialBarChart
              innerRadius="75%"
              outerRadius="100%"
              {...sharedChartProps}
            >
              <RadialBar dataKey="value" animationDuration={200}>
                {cells}
              </RadialBar>

              {tooltip}
            </RadialBarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="absolute center flex flex-col justify-center items-center z-[-1]">
        <Typography variant="body2" fw="normal" className="dark:text-mono-120">
          Restaked
        </Typography>
        <Typography
          variant="h5"
          fw="bold"
          className="dark:text-mono-0 text-center"
        >
          {formatTokenBalance(allocatedAmount, false)}
        </Typography>
        <Typography variant="body2" className="dark:text-mono-120">
          {TANGLE_TOKEN_UNIT}
        </Typography>
      </div>
    </div>
  );
};

export default AllocationChart;
