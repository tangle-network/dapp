import { FC } from 'react';
import {
  Button,
  Card,
  CardVariant,
  EMPTY_VALUE_PLACEHOLDER,
  SkeletonLoader,
  Typography,
} from '@tangle-network/ui-components';
import type { Operator } from '@tangle-network/tangle-shared-ui/data/graphql/useOperators';
import { formatUnits, Address } from 'viem';
import { twMerge } from 'tailwind-merge';

interface Props {
  operatorMap: Map<Address, Operator> | null;
  isLoading: boolean;
  onRestakeClicked: () => void;
}

const formatStake = (stake: bigint | null): string => {
  if (stake === null) return EMPTY_VALUE_PLACEHOLDER;
  const formatted = formatUnits(stake, 18);
  const num = parseFloat(formatted);
  if (num === 0) return '0';
  if (num < 0.0001) return '< 0.0001';
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  });
};

const getStatusColor = (status: string | null): string => {
  switch (status) {
    case 'ACTIVE':
      return 'text-green-50';
    case 'LEAVING':
      return 'text-yellow-50';
    case 'INACTIVE':
      return 'text-red-50';
    default:
      return 'text-mono-100';
  }
};

export const OperatorsTable: FC<Props> = ({
  operatorMap,
  isLoading,
  onRestakeClicked,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <SkeletonLoader className="h-16" />
        <SkeletonLoader className="h-16" />
        <SkeletonLoader className="h-16" />
      </div>
    );
  }

  const operators = operatorMap ? Array.from(operatorMap.values()) : [];

  if (operators.length === 0) {
    return (
      <Card variant={CardVariant.GLASS} className="p-6 text-center">
        <Typography variant="body1" className="text-mono-120 dark:text-mono-80">
          No operators available.
        </Typography>
        <Button className="mt-4" onClick={onRestakeClicked}>
          Register as Operator
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-5 gap-4 px-4 py-2 text-mono-120 dark:text-mono-80">
        <Typography variant="body2" fw="semibold">
          Operator
        </Typography>
        <Typography variant="body2" fw="semibold" className="text-right">
          Status
        </Typography>
        <Typography variant="body2" fw="semibold" className="text-right">
          Stake
        </Typography>
        <Typography variant="body2" fw="semibold" className="text-right">
          Delegations
        </Typography>
        <Typography variant="body2" fw="semibold" className="text-right">
          Action
        </Typography>
      </div>

      {/* Rows */}
      {operators.map((operator) => (
        <Card
          key={operator.id}
          variant={CardVariant.GLASS}
          className={twMerge(
            'grid grid-cols-5 gap-4 px-4 py-3 items-center',
            'hover:bg-mono-20/50 dark:hover:bg-mono-180/50 transition-colors',
          )}
        >
          <div>
            <Typography variant="body1" fw="semibold">
              {operator.id.slice(0, 6)}...{operator.id.slice(-4)}
            </Typography>
            {operator.rpcAddress && (
              <Typography
                variant="body2"
                className="text-mono-100 dark:text-mono-100 truncate max-w-32"
              >
                {operator.rpcAddress}
              </Typography>
            )}
          </div>

          <Typography
            variant="body1"
            className={twMerge(
              'text-right',
              getStatusColor(operator.restakingStatus),
            )}
          >
            {operator.restakingStatus ?? EMPTY_VALUE_PLACEHOLDER}
          </Typography>

          <Typography variant="body1" className="text-right">
            {formatStake(operator.restakingStake)}
          </Typography>

          <Typography variant="body1" className="text-right">
            {operator.restakingDelegationCount?.toString() ??
              EMPTY_VALUE_PLACEHOLDER}
          </Typography>

          <div className="text-right">
            <Button
              variant="secondary"
              size="sm"
              onClick={onRestakeClicked}
              isDisabled={operator.restakingStatus !== 'ACTIVE'}
            >
              Delegate
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default OperatorsTable;
