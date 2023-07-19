'use client';

import { FC, useState } from 'react';
import { TableAndChartTabs, Typography } from '@webb-tools/webb-ui-components';

import { NetworkTable } from '../../components';
import { TokenCompositionType } from '../../components/NetworkTable/types';

const NetworkTableContainer: FC = () => {
  const [chains, setChains] = useState<number[]>([]);
  const [tvlData, setTvlData] = useState<TokenCompositionType[]>([]);
  const [volumeData, setVolumeData] = useState<TokenCompositionType[]>([]);
  const [depositsData, setDepositsData] = useState<TokenCompositionType[]>([]);
  const [feesData, setFeesData] = useState<TokenCompositionType[]>([]);

  return (
    <div className="space-y-1">
      <TableAndChartTabs tabs={['TVL', 'Volume', '24H Deposits', 'Fees']}>
        <NetworkTable chains={chains} data={tvlData} />
      </TableAndChartTabs>
      {chains.length > 0 && (
        <Typography
          variant="body2"
          className="font-bold !text-[12px] !text-mono-120 text-right"
        >
          *TOKEN NOT SUPPORTED ON NETWORK
        </Typography>
      )}
    </div>
  );
};

export default NetworkTableContainer;
