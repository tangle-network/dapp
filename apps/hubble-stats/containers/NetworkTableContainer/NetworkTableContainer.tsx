'use client';

import { FC } from 'react';
import { TableAndChartTabs, Typography } from '@webb-tools/webb-ui-components';

import { NetworkTable } from '../../components';
import { TokenCompositionType } from '../../components/NetworkTable/types';

interface NetworkTableContainerProps {
  chains?: number[];
  tvlData?: TokenCompositionType[];
  volumeData?: TokenCompositionType[];
  depositsData?: TokenCompositionType[];
  feesData?: TokenCompositionType[];
}

const NetworkTableContainer: FC<NetworkTableContainerProps> = ({
  chains = [],
  tvlData = [],
  volumeData = [],
  depositsData = [],
  feesData = [],
}) => {
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
