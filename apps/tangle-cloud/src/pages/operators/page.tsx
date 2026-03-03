import { useOperators } from '@tangle-network/tangle-shared-ui/data/graphql/useOperators';
import { OperatorsTable } from '@tangle-network/tangle-shared-ui/components/tables/OperatorsTable';
import { FC, useCallback } from 'react';
import { Address } from 'viem';
import { useNavigate } from 'react-router';
import { Button, Typography } from '@tangle-network/ui-components';
import { PagePath } from '../../types';
import { useAccount } from 'wagmi';
import createStakeDelegateUrl from './createStakeDelegateUrl';

const Page: FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { data: operators, isLoading } = useOperators();

  // Convert operators to Map format expected by table
  const operatorMap = operators
    ? new Map(operators.map((op) => [op.id as Address, op]))
    : null;

  const handleStakeClicked = useCallback((operatorAddress?: Address) => {
    window.location.assign(createStakeDelegateUrl(operatorAddress));
  }, []);

  return (
    <div className="!mt-16">
      {/* Header with Manage Button */}
      <div className="flex justify-between items-center mb-6 px-4 lg:px-0">
        <div>
          <Typography variant="h4">Operators</Typography>
          <Typography variant="body2" className="text-mono-100 mt-1">
            Browse operators in the network
          </Typography>
        </div>

        {isConnected && (
          <Button
            variant="secondary"
            onClick={() => navigate(PagePath.OPERATORS_MANAGE)}
          >
            Manage Registrations
          </Button>
        )}
      </div>

      <OperatorsTable
        operatorMap={operatorMap}
        isLoading={isLoading}
        onStakeClicked={handleStakeClicked}
      />
    </div>
  );
};

export default Page;
