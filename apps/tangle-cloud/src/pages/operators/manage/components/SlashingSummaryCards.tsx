import {
  SlashDisputeEligibility,
  SlashProposal,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { Card, Typography } from '@tangle-network/ui-components';
import { formatDateTime, formatTimeRemaining } from '../utils';

interface SlashingSummaryCardsProps {
  activeRegistrationsCount: number;
  activeAgainstMeCount: number;
  myActiveProposalCount: number;
  nearestPendingSlash: SlashProposal | null;
  nearestPendingSlashEligibility: SlashDisputeEligibility | null;
}

const SlashingSummaryCards = ({
  activeRegistrationsCount,
  activeAgainstMeCount,
  myActiveProposalCount,
  nearestPendingSlash,
  nearestPendingSlashEligibility,
}: SlashingSummaryCardsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <Typography variant="body2" className="text-mono-100">
            Active Registrations
          </Typography>
          <Typography variant="h4" className="mt-1">
            {activeRegistrationsCount}
          </Typography>
        </Card>

        <Card className="p-4">
          <Typography variant="body2" className="text-mono-100">
            Active Against You
          </Typography>
          <Typography variant="h4" className="mt-1">
            {activeAgainstMeCount}
          </Typography>
        </Card>

        <Card className="p-4">
          <Typography variant="body2" className="text-mono-100">
            My Active Proposals
          </Typography>
          <Typography variant="h4" className="mt-1">
            {myActiveProposalCount}
          </Typography>
        </Card>
      </div>

      {nearestPendingSlash && nearestPendingSlashEligibility ? (
        <Card className="p-4 !border-yellow-400/30 !bg-yellow-500/15">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <Typography variant="body2" fw="bold" className="text-yellow-400">
              Nearest Dispute Deadline Against You
            </Typography>
          </div>
          <Typography variant="h5" fw="bold" className="text-mono-0">
            Slash #{nearestPendingSlash.id.toString()}{' '}
            <span className="font-normal text-mono-100">expires at</span>{' '}
            {formatDateTime(nearestPendingSlash.executeAfter)}
          </Typography>
          <Typography
            variant="body2"
            fw="semibold"
            className="text-yellow-300/80 mt-1.5"
          >
            Time remaining:{' '}
            {formatTimeRemaining(
              nearestPendingSlashEligibility.secondsUntilDeadline,
            )}
          </Typography>
        </Card>
      ) : null}
    </>
  );
};

export default SlashingSummaryCards;
