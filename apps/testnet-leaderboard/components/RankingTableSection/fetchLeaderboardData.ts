import { BACKEND_URL, DEFAULT_LIMIT, DEFAULT_SKIP } from '../../constants';
import { LeaderboardResponseSchema } from './types';

const fetchLeaderboardData = async (
  skip = DEFAULT_SKIP,
  limit = DEFAULT_LIMIT
) => {
  const searchParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(
    `${BACKEND_URL}/leaderboard?${searchParams.toString()}`
  );

  const data = await response.json();

  return LeaderboardResponseSchema.safeParse(data);
};

export default fetchLeaderboardData;
