import { FC, useMemo } from 'react';
import { Address } from 'viem';
import { Chip, Skeleton, Text } from '../sandbox/SandboxUi';
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

const shortenString = (value: string, chars = 6) =>
  value.length <= chars * 2 + 3
    ? value
    : `${value.slice(0, chars)}...${value.slice(-chars)}`;

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
        <Text variant="h5" className="text-foreground">
          Operator Status
        </Text>

        <Skeleton className="h-5 w-32 mb-2" />

        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  const totalOperators = operatorCandidates.length;

  return (
    <div className="space-y-2">
      <Text variant="h5" className="text-foreground">
        Operator Status
      </Text>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-muted-foreground">Progress:</span>

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
                  ? 'bg-primary/10 border border-primary/20'
                  : 'bg-muted/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted font-mono text-[10px] text-muted-foreground">
                  {address.slice(2, 4).toUpperCase()}
                </span>

                <span className="text-sm font-mono">
                  {shortenString(address, 6)}
                </span>

                {isCurrentOperator && (
                  <span className="text-xs text-primary">(You)</span>
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
