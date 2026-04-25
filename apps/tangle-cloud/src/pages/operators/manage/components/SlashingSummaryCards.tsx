import {
  SlashDisputeEligibility,
  SlashProposal,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { Card } from '@tangle-network/sandbox-ui/primitives';
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
          <p className="text-muted-foreground text-sm">Active Registrations</p>
          <p className="mt-1 font-display font-bold text-3xl text-foreground">
            {activeRegistrationsCount}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-muted-foreground text-sm">Active Against You</p>
          <p className="mt-1 font-display font-bold text-3xl text-foreground">
            {activeAgainstMeCount}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-muted-foreground text-sm">My Active Proposals</p>
          <p className="mt-1 font-display font-bold text-3xl text-foreground">
            {myActiveProposalCount}
          </p>
        </Card>
      </div>

      {nearestPendingSlash && nearestPendingSlashEligibility ? (
        <Card className="p-4 !border-yellow-400/30 !bg-yellow-500/15">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <p className="font-bold text-sm text-yellow-400">
              Nearest Dispute Deadline Against You
            </p>
          </div>
          <p className="font-display font-bold text-foreground text-xl">
            Slash #{nearestPendingSlash.id.toString()}{' '}
            <span className="font-normal text-muted-foreground">
              expires at
            </span>{' '}
            {formatDateTime(nearestPendingSlash.executeAfter)}
          </p>
          <p className="mt-1.5 font-semibold text-sm text-yellow-300/80">
            Time remaining:{' '}
            {formatTimeRemaining(
              nearestPendingSlashEligibility.secondsUntilDeadline,
            )}
          </p>
        </Card>
      ) : null}
    </>
  );
};

export default SlashingSummaryCards;
