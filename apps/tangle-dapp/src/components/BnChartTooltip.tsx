import { assert, BN } from '@polkadot/util';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { TooltipProps } from 'recharts';
import { z } from 'zod';

import { RestakingAllocationMap } from '../containers/ManageProfileModalContainer/types';
import { AllocationChartEntryName } from '../containers/ManageProfileModalContainer/useAllocationChartEntries';
import { RestakingService } from '../types';
import formatTangleBalance from '../utils/formatTangleBalance';

const BnChartTooltip = (
  allocations: RestakingAllocationMap,
  maxAmount: BN,
  allocatedAmount: BN,
  previewAmount: BN,
  displayAmount: boolean,
) => {
  const { nativeTokenSymbol } = useNetworkStore();

  const composition = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || payload === undefined || payload.length === 0) {
      return null;
    }

    // Validate the label, since for some reason it has
    // type `any` in the payload object.
    const entryName: AllocationChartEntryName = z
      .union([
        z.literal('Remaining' satisfies AllocationChartEntryName),
        z.literal('New Allocation' satisfies AllocationChartEntryName),
        z.nativeEnum(RestakingService),
      ])
      .parse(payload[0].payload.name);

    const remainingAmount = maxAmount.sub(allocatedAmount).sub(previewAmount);

    const amount =
      entryName === 'Remaining'
        ? remainingAmount
        : entryName === 'New Allocation'
          ? previewAmount
          : allocations[entryName];

    assert(
      amount !== undefined,
      'Service type should have an allocated amount in the allocation map',
    );

    return (
      <div
        key={entryName}
        className="px-4 py-2 text-center rounded-lg bg-mono-0 dark:bg-mono-180 text-mono-120 dark:text-mono-80"
      >
        <Typography variant="body2" fw="semibold">
          {entryName}

          {displayAmount &&
            `: ${formatTangleBalance(amount, nativeTokenSymbol)}`}
        </Typography>
      </div>
    );
  };

  return composition;
};

export default BnChartTooltip;
