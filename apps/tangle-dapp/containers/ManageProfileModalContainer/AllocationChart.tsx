import { BN, BN_ZERO } from '@polkadot/util';
import { Typography, useNextDarkMode } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
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
import { ChartColor } from '../../constants';
import useNetworkStore from '../../context/useNetworkStore';
import useRestakingLimits from '../../data/restaking/useRestakingLimits';
import { RestakingService } from '../../types';
import { getChartDataAreaColorByServiceType } from '../../utils';
import formatTangleBalance from '../../utils/formatTangleBalance';
import { RestakingAllocationMap } from './types';
import useAllocationChartEntries, {
  AllocationChartEntryName,
} from './useAllocationChartEntries';

export enum AllocationChartVariant {
  INDEPENDENT,
  SHARED,
}

export type AllocationChartProps = {
  variant: AllocationChartVariant;
  allocations: RestakingAllocationMap;
  allocatedAmount: BN;
  previewAmount?: BN;
  previewRole?: RestakingService;
};

function getChartColorOfEntryName(
  entryName: AllocationChartEntryName,
): ChartColor {
  switch (entryName) {
    case 'Remaining':
      return ChartColor.DARK_GRAY;
    case 'New Allocation':
      return ChartColor.LAVENDER;
    default:
      return getChartDataAreaColorByServiceType(entryName);
  }
}

const AllocationChart: FC<AllocationChartProps> = ({
  allocatedAmount,
  allocations,
  variant,
  previewAmount,
  previewRole,
}) => {
  const [isDarkMode] = useNextDarkMode();
  const { maxRestakingAmount } = useRestakingLimits();
  const { nativeTokenSymbol } = useNetworkStore();

  const { allocationEntries, entries } = useAllocationChartEntries(
    allocations,
    allocatedAmount,
    variant,
    previewAmount,
  );

  const themeCellColor: ChartColor = isDarkMode
    ? ChartColor.DARK_GRAY
    : ChartColor.GRAY;

  const tooltip = (
    <RechartsTooltip
      content={BnChartTooltip(
        allocations,
        maxRestakingAmount ?? BN_ZERO,
        allocatedAmount,
        previewAmount ?? BN_ZERO,
        variant === AllocationChartVariant.INDEPENDENT,
      )}
    />
  );

  const cellColors = (
    <>
      {(variant === AllocationChartVariant.INDEPENDENT ||
        allocationEntries.length === 0) && (
        <Cell key="remaining-independent" fill={themeCellColor} />
      )}

      {variant === AllocationChartVariant.INDEPENDENT &&
        previewAmount !== undefined &&
        !previewAmount.isZero() && (
          <Cell
            key="new-allocation"
            fill={
              // The preview amount could be defined, but no role yet
              // selected for it.
              previewRole !== undefined
                ? getChartColorOfEntryName(previewRole)
                : ChartColor.GREEN
            }
          />
        )}

      {allocationEntries.map((entry) => (
        <Cell key={entry.name} fill={getChartColorOfEntryName(entry.name)} />
      ))}
    </>
  );

  const sharedChartProps = {
    // TODO: Something's causing a duplicate key prop error within the Pie component. Need to investigate what it is (`sector-333-333`).
    data: entries,
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
                {cellColors}
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
                {cellColors}
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
          {formatTangleBalance(allocatedAmount)}
        </Typography>

        <Typography variant="body2" className="dark:text-mono-120">
          {nativeTokenSymbol}
        </Typography>
      </div>
    </div>
  );
};

export default AllocationChart;
