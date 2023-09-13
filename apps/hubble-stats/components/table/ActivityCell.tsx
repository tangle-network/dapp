import { FC, useMemo } from 'react';
import { Typography } from '@webb-tools/webb-ui-components';
import { chainsConfig } from '@webb-tools/dapp-config/chains';
import { getExplorerURI } from '@webb-tools/api-provider-environment/transaction/utils';

import { ActivityCellProps } from './types';

const ActivityCell: FC<ActivityCellProps> = ({
  txHash,
  activity,
  sourceTypedChainId,
}) => {
  const activityText = useMemo(
    () => (
      <Typography
        variant="body1"
        className="capitalize text-blue-70 dark:text-blue-50"
      >
        {activity}
      </Typography>
    ),
    [activity]
  );

  const blockExplorerUrl =
    chainsConfig[sourceTypedChainId]?.blockExplorers?.default?.url;

  if (blockExplorerUrl) {
    const explorerURI = getExplorerURI(blockExplorerUrl, txHash, 'tx', 'web3');
    return (
      <a href={explorerURI.toString()} target="_blank" rel="noreferrer">
        {activityText}
      </a>
    );
  }

  return activityText;
};

export default ActivityCell;
