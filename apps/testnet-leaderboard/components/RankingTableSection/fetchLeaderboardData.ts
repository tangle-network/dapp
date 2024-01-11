import { BACKEND_URL, DEFAULT_LIMIT, DEFAULT_SKIP } from '../../constants';
import { LeaderboardResponseSchema } from './types';

const fetchLeaderboardData = async (
  skip = DEFAULT_SKIP,
  limit = DEFAULT_LIMIT,
  query = ''
) => {
  const searchParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  if (query) {
    searchParams.append('q', query);
    searchParams.set('skip', DEFAULT_SKIP.toString()); // reset skip when searching
  }

  const response = await fetch(
    `${BACKEND_URL}/leaderboard?${searchParams.toString()}`,
    { next: { revalidate: 3600 } } // 1 hour
  );

  const data = await response.json();

  return LeaderboardResponseSchema.safeParse(data);
};

export default fetchLeaderboardData;
