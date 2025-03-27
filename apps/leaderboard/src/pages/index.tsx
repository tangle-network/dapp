import { AwardIcon } from '@tangle-network/icons';
import { Typography } from '@tangle-network/ui-components';
import IndexingProgressCard from '../components/IndexingProgressCard';
import { LeaderboardTable } from '../components/LeaderboardTable';

export default function IndexPage() {
  return (
    <div className="container mx-auto space-y-6">
      <div className="max-w-xl">
        <Typography
          variant="h3"
          component="h1"
          className="font-semibold antialiased flex items-center gap-1"
        >
          <AwardIcon width={28} height={28} />
          Account Leaderboard
        </Typography>
        <Typography
          variant="body1"
          className="text-mono-100 dark:text-mono-120"
        >
          Tangle leaderboard ranks contributors based on points earned from
          network activities like staking, nominating, and running services.
        </Typography>
      </div>

      <IndexingProgressCard />

      <LeaderboardTable />
    </div>
  );
}
