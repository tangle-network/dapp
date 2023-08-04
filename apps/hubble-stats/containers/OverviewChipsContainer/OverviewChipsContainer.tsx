import numbro from 'numbro';
import { Chip } from '@webb-tools/webb-ui-components';
import { BlockIcon } from '@webb-tools/icons';

import { getOverviewChipsData } from '../../data';

export default async function OverviewChipsContainer() {
  const { tvl, volume } = await getOverviewChipsData();

  return (
    <div className="hidden md:flex items-center gap-4">
      <Chip color="blue">
        <BlockIcon size="lg" className="stroke-blue-90 dark:stroke-blue-30" />
        TVL: ${numbro(tvl).format({ thousandSeparated: true })}
      </Chip>

      <Chip color="blue">
        <BlockIcon size="lg" className="stroke-blue-90 dark:stroke-blue-30" />
        Volume: ${numbro(volume).format({ thousandSeparated: true })}
      </Chip>
    </div>
  );
}
