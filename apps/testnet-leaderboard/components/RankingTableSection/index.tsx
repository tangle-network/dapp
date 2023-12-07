import { LoggerService } from '@webb-tools/browser-utils/logger';

import fetchLeaderboardData from './fetchLeaderboardData';
import ParseReponseErrorView from './ParseReponseErrorView';
import RankingTableView from './RankingTableView';
import { filterData } from './utils';

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
    <RankingTableView participants={filterData(parsedData).participants} />
  );
};

export default RankingTableSection;
