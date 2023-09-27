import { ArrowRightUp, DatabaseLine } from '@webb-tools/icons';

import { HeaderChipItem } from '../../components';
import { getTvl } from '../../data';
import { getHistoricalDepositData } from '../../data/headerChips';

export default async function OverviewChipsContainer() {
  return (
    <div className="hidden md:flex items-center gap-2 lg:gap-4">
      <HeaderChipItem Icon={DatabaseLine} label="TVL" dataFetcher={getTvl} />

      <HeaderChipItem
        Icon={ArrowRightUp}
        label="DEPOSITS"
        hasTooltip
        tooltipContent="Historical Deposit Volume"
        dataFetcher={getHistoricalDepositData}
      />
    </div>
  );
}
