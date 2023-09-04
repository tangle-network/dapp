import { Chip } from '@webb-tools/webb-ui-components';
import { BlockIcon } from '@webb-tools/icons';

import { getOverviewChipsData } from '../../data';
import { getRoundedDownNumberWith2Decimals } from '../../utils';

export default async function OverviewChipsContainer() {
  const { tvl, deposit } = await getOverviewChipsData();

  return (
    <div className="hidden md:flex items-center gap-4">
      <Chip color="blue" className="normal-case">
        <BlockIcon size="lg" className="stroke-blue-90 dark:stroke-blue-30" />
        TVL:{' '}
        {typeof tvl === 'number'
          ? getRoundedDownNumberWith2Decimals(tvl)
          : '-'}{' '}
        tTNT
      </Chip>

      <Chip color="blue" className="normal-case">
        <BlockIcon size="lg" className="stroke-blue-90 dark:stroke-blue-30" />
        DEPOSITS:{' '}
        {typeof deposit === 'number'
          ? getRoundedDownNumberWith2Decimals(deposit)
          : '-'}{' '}
        tTNT
      </Chip>
    </div>
  );
}
