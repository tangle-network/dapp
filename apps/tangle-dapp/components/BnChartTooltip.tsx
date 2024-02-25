import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import BN from 'bn.js';
import { TooltipProps } from 'recharts';

import { ServiceType } from '../types';
import { formatTokenBalance } from '../utils/polkadot/tokens';

const BnChartTooltip = (
  allocations: Record<ServiceType, BN | null>,
  freeBalance: BN,
  restakedAmount: BN
) => {
  const composition = ({
    active,
    payload,
  }: TooltipProps<number, ServiceType>) => {
    const role = payload?.[0]?.name;

    if (!active || payload === undefined || role === undefined) {
      return null;
    }

    const remainingItem: [string, BN | null] = [
      'Remaining',
      freeBalance.sub(restakedAmount),
    ];

    const amount = allocations[role] ?? remainingItem[1];

    return (
      <div
        key={role}
        className="px-4 py-2 rounded-lg bg-mono-0 dark:bg-mono-180 text-mono-120 dark:text-mono-80 text-center"
      >
        <Typography variant="body2" fw="semibold">
          {payload[0].name}: {formatTokenBalance(amount as BN)}
        </Typography>
      </div>
    );
  };

  return composition;
};

export default BnChartTooltip;
