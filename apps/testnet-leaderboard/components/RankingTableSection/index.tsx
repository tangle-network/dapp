import { LoggerService } from '@webb-tools/browser-utils/logger';
import { FC } from 'react';
import { unstable_serialize } from 'swr';

import { DEFAULT_LIMIT, DEFAULT_SKIP } from '../../constants';
import fetchLeaderboardData from './fetchLeaderboardData';
import ParseResponseErrorView from './ParseResponseErrorView';
import RankingTableView from './RankingTableView';
import SWRProvider from './SWRProvider';

const logger = LoggerService.get('RankingTableSection');

type Props = {
  className?: string;
};

const RankingTableSection: FC<Props> = async ({ className }) => {
  const result = await fetchLeaderboardData();

  if (!result.success) {
    logger.error('Failed to fetch leaderboard data', result.error.issues);
    return <ParseResponseErrorView />;
  }

  const parsedData = result.data;

  if (!parsedData.success) {
    return <ParseResponseErrorView errorMessage={parsedData.error} />;
  }

  return (
    <SWRProvider
      cacheKey={unstable_serialize([
        fetchLeaderboardData.name,
        DEFAULT_SKIP,
        DEFAULT_LIMIT,
      ])}
      result={result}
    >
      <RankingTableView className={className} {...parsedData.data} />
    </SWRProvider>
  );
};

export default RankingTableSection;
