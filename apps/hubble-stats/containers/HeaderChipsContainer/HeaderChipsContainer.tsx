import { ArrowRightUp, DatabaseLine } from '@webb-tools/icons';

import { HeaderChipItem } from '../../components';
import { getHeaderChipsTvlData, getHeaderChipsDepositData } from '../../data';

export default function HeaderChipsContainer() {
  return (
    <div className="items-center hidden gap-2 md:flex lg:gap-4">
      <HeaderChipItem
        Icon={DatabaseLine}
        label="TVL"
        dataFetcher={getHeaderChipsTvlData}
      />

      <HeaderChipItem
        Icon={ArrowRightUp}
        label="DEPOSITS"
        hasTooltip
        tooltipContent="Historical Deposit Volume"
        dataFetcher={getHeaderChipsDepositData}
      />
    </div>
  );
}
