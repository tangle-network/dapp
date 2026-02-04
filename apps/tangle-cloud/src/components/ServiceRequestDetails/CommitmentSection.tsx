import { FC } from 'react';
import {
  Chip,
  SkeletonLoader,
  Typography,
} from '@tangle-network/ui-components';
import {
  MembershipModel,
  getMembershipLabel,
  formatTtl,
  formatCreatedAt,
} from '../../types/serviceRequest';

type Props = {
  ttl: bigint | undefined;
  createdAt: bigint | undefined;
  membership: MembershipModel | undefined;
  minOperators: number | undefined;
  maxOperators: number | undefined;
  totalOperators: number;
  isLoading: boolean;
};

const CommitmentSection: FC<Props> = ({
  ttl,
  createdAt,
  membership,
  minOperators,
  maxOperators: _maxOperators,
  totalOperators,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Typography variant="h5" className="text-mono-200 dark:text-mono-0">
          Commitment Details
        </Typography>

        <div className="space-y-1">
          <SkeletonLoader className="h-5 w-36" />
          <SkeletonLoader className="h-5 w-32" />
          <SkeletonLoader className="h-5 w-28" />
        </div>
      </div>
    );
  }

  const durationText = ttl !== undefined ? formatTtl(ttl) : '-';
  const createdText =
    createdAt !== undefined ? formatCreatedAt(createdAt) : '-';

  // For Fixed: all operators required. For Dynamic: use minOperators.
  const minApprovalsRequired =
    membership === MembershipModel.Fixed
      ? totalOperators
      : (minOperators ?? totalOperators);

  return (
    <div className="space-y-2">
      <Typography variant="h5" className="text-mono-200 dark:text-mono-0">
        Commitment Details
      </Typography>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm text-mono-140 dark:text-mono-80">
            Duration:
          </span>
          <span className="text-sm font-semibold">{durationText}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-mono-140 dark:text-mono-80">
            Created:
          </span>
          <span className="text-sm font-semibold">{createdText}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-mono-140 dark:text-mono-80">
            Membership:
          </span>
          <Chip
            color={membership === MembershipModel.Fixed ? 'blue' : 'purple'}
          >
            {membership !== undefined ? getMembershipLabel(membership) : '-'}
          </Chip>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-mono-140 dark:text-mono-80">
            Min. Approvals Required:
          </span>
          <span className="text-sm font-semibold">{minApprovalsRequired}</span>
        </div>
      </div>
    </div>
  );
};

export default CommitmentSection;
