import { Button, Typography } from '@tangle-network/ui-components';
import { LeaderboardTable } from '../features/leaderboard';

export default function IndexPage() {
  return (
    <div className="container mx-auto space-y-6">
      <div className="max-w-2xl">
        <Typography
          variant="h3"
          component="h1"
          className="font-semibold antialiased flex items-center gap-1"
        >
          Season 1 Leaderboard
        </Typography>
        <Typography variant="body1" className="!text-mono-120">
          Tangle leaderboard ranks contributors based on experience points (XP)
          earned from network activities like staking, nominating, and running
          services.{' '}
          <Button
            className="inline-flex"
            target="_blank"
            href="https://docs.tangle.tools/network/points-mechanics"
            rel="noopener noreferrer"
            variant="link"
            size="sm"
          >
            (Learn How)
          </Button>
        </Typography>
      </div>

      <LeaderboardTable />
    </div>
  );
}
