'use client';

import { ArrowRightUp, DatabaseLine } from '@webb-tools/icons';
import useSWR from 'swr';
import { HeaderChipItem } from '../../components';
import { getHeaderChipsDepositData, getHeaderChipsTvlData } from '../../data';

export default function HeaderChipsContainer() {
  const { data: tvlValue, isLoading: tvlLoading } = useSWR(
    getHeaderChipsTvlData.name,
    getHeaderChipsTvlData
  );

  const { data: depositValue, isLoading: depositLoading } = useSWR(
    getHeaderChipsDepositData.name,
    getHeaderChipsDepositData
  );

  return (
    <div className="items-center hidden gap-2 md:flex lg:gap-4">
      <HeaderChipItem
        Icon={DatabaseLine}
        label="TVL"
        isLoading={tvlLoading}
        value={tvlValue}
      />

      <HeaderChipItem
        Icon={ArrowRightUp}
        label="DEPOSITS"
        hasTooltip
        tooltipContent="Historical Deposit Volume"
        isLoading={depositLoading}
        value={depositValue}
      />
    </div>
  );
}
