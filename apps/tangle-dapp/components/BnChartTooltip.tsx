import { BN } from '@polkadot/util';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { TooltipProps } from 'recharts';
import { z } from 'zod';

import { EntryName } from '../containers/ManageProfileModalContainer/AllocationChart';
import { RestakingAllocationMap } from '../containers/ManageProfileModalContainer/types';
import { ServiceType } from '../types';
import { formatTokenBalance } from '../utils/polkadot/tokens';

const BnChartTooltip = (
  allocations: RestakingAllocationMap,
  maxAmount: BN,
  allocatedAmount: BN,
  previewAmount: BN,
  displayAmount: boolean
) => {
  const composition = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || payload === undefined || payload.length === 0) {
      return null;
    }

    // Validate the label, since for some reason it has
    // type `any` in the payload object.
    const entryName: EntryName = z
      .union([
        z.literal('Remaining' satisfies EntryName),
        z.literal('New Allocation' satisfies EntryName),
        z.nativeEnum(ServiceType),
      ])
      .parse(payload[0].payload.name);

    const remainingAmount = maxAmount.sub(allocatedAmount).sub(previewAmount);

    const amount =
      entryName === 'Remaining'
        ? remainingAmount
        : entryName === 'New Allocation'
        ? previewAmount
        : allocations[entryName];

    return (
      <div
        key={entryName}
        className="px-4 py-2 rounded-lg bg-mono-0 dark:bg-mono-180 text-mono-120 dark:text-mono-80 text-center"
      >
        <Typography variant="body2" fw="semibold">
          {entryName}

          {displayAmount && `: ${formatTokenBalance(amount ?? new BN(0))}`}
        </Typography>
      </div>
    );
  };

  return composition;
};

export default BnChartTooltip;
