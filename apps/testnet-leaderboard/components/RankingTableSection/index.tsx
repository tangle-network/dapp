import { LoggerService } from '@webb-tools/browser-utils/logger';
import { unstable_serialize } from 'swr';

import { DEFAULT_LIMIT, DEFAULT_SKIP } from '../../constants';
import fetchLeaderboardData from './fetchLeaderboardData';
import ParseReponseErrorView from './ParseReponseErrorView';
import RankingTableView from './RankingTableView';
import SWRProvider from './SWRProvider';

const logger = LoggerService.get('RankingTableSection');

const RankingTableSection = async () => {
  const result = await fetchLeaderboardData();

  if (!result.success) {
    logger.error('Failed to fetch leaderboard data', result.error.issues);
    return <ParseReponseErrorView />;
  }

  const parsedData = result.data;

  if (!parsedData.success) {
    return <ParseReponseErrorView errorMessage={parsedData.error} />;
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
      <RankingTableView {...parsedData.data} />
    </SWRProvider>
  );
};

export default RankingTableSection;
