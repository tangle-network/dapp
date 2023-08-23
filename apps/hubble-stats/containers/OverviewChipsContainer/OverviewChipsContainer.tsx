import { Chip } from '@webb-tools/webb-ui-components';
import { BlockIcon } from '@webb-tools/icons';

import { getOverviewChipsData } from '../../data';
import { getRoundedDownWith2Decimals } from '../../utils';

export default async function OverviewChipsContainer() {
  const { tvl, volume } = await getOverviewChipsData();

  return (
    <div className="hidden md:flex items-center gap-4">
      <Chip color="blue">
        <BlockIcon size="lg" className="stroke-blue-90 dark:stroke-blue-30" />
        TVL: ${typeof tvl === 'number' ? getRoundedDownWith2Decimals(tvl) : '-'}
      </Chip>

      <Chip color="blue">
        <BlockIcon size="lg" className="stroke-blue-90 dark:stroke-blue-30" />
        Volume: $
        {typeof volume === 'number' ? getRoundedDownWith2Decimals(volume) : '-'}
      </Chip>
    </div>
  );
}
