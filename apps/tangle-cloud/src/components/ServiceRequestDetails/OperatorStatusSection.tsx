import { FC, useMemo } from 'react';
import { Address } from 'viem';
import {
  Avatar,
  Chip,
  SkeletonLoader,
  Typography,
} from '@tangle-network/ui-components';
import { shortenString } from '@tangle-network/ui-components/utils/shortenString';
import {
  OperatorApprovalStatus,
  OperatorWithStatus,
} from '../../types/serviceRequest';

type Props = {
  operatorCandidates: Address[];
  approvedOperators: Address[];
  rejectedOperators: Address[];
  approvalCount: number;
  currentOperator: Address | undefined;
  isLoading: boolean;
};

const getStatusColor = (status: OperatorApprovalStatus) => {
  switch (status) {
    case 'approved':
      return 'green';
    case 'rejected':
      return 'red';
    case 'pending':
    default:
      return 'yellow';
  }
};

const getStatusLabel = (status: OperatorApprovalStatus) => {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'pending':
    default:
      return 'Pending';
  }
};

const OperatorStatusSection: FC<Props> = ({
  operatorCandidates,
  approvedOperators,
  rejectedOperators,
  approvalCount,
  currentOperator,
  isLoading,
}) => {
  const operatorsWithStatus = useMemo((): OperatorWithStatus[] => {
    const approvedSet = new Set(
      approvedOperators.map((addr) => addr.toLowerCase()),
    );
    const rejectedSet = new Set(
      rejectedOperators.map((addr) => addr.toLowerCase()),
    );

    return operatorCandidates.map((address) => {
      const addrLower = address.toLowerCase();
      let status: OperatorApprovalStatus = 'pending';

      if (approvedSet.has(addrLower)) {
        status = 'approved';
      } else if (rejectedSet.has(addrLower)) {
        status = 'rejected';
      }

      return { address, status };
    });
  }, [operatorCandidates, approvedOperators, rejectedOperators]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Typography variant="h5" className="text-mono-200 dark:text-mono-0">
          Operator Status
        </Typography>

        <SkeletonLoader className="h-5 w-32 mb-2" />

        <div className="space-y-2">
          <SkeletonLoader className="h-10 w-full" />
          <SkeletonLoader className="h-10 w-full" />
        </div>
      </div>
    );
  }

  const totalOperators = operatorCandidates.length;

  return (
    <div className="space-y-2">
      <Typography variant="h5" className="text-mono-200 dark:text-mono-0">
        Operator Status
      </Typography>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-mono-140 dark:text-mono-80">
          Progress:
        </span>

        <span className="text-sm font-semibold">
          {approvalCount}/{totalOperators} operators approved
        </span>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {operatorsWithStatus.map(({ address, status }) => {
          const isCurrentOperator =
            currentOperator?.toLowerCase() === address.toLowerCase();

          return (
            <div
              key={address}
              className={`flex items-center justify-between p-2 rounded-lg ${
                isCurrentOperator
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  : 'bg-mono-20 dark:bg-mono-180'
              }`}
            >
              <div className="flex items-center gap-2">
                <Avatar
                  sourceVariant="address"
                  value={address}
                  size="sm"
                  theme="substrate"
                />

                <span className="text-sm font-mono">
                  {shortenString(address, 6)}
                </span>

                {isCurrentOperator && (
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    (You)
                  </span>
                )}
              </div>

              <Chip color={getStatusColor(status)}>
                {getStatusLabel(status)}
              </Chip>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OperatorStatusSection;
