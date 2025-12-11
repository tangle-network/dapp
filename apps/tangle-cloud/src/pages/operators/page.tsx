import { useOperators } from '@tangle-network/tangle-shared-ui/data/graphql/useOperators';
import { OperatorsTable } from '@tangle-network/tangle-shared-ui/components/tables/OperatorsTable';
import { FC, useCallback } from 'react';
import { Address } from 'viem';

const Page: FC = () => {
  const { data: operators, isLoading } = useOperators();

  // Convert operators to Map format expected by table
  const operatorMap = operators
    ? new Map(operators.map((op) => [op.id as Address, op]))
    : null;

  const handleRestakeClicked = useCallback(() => {
    // TODO: Redirect to tangle-dapp restake/delegate page
    console.log('Redirecting to restake/delegate page');
  }, []);

  return (
    <div className="!mt-16">
      <OperatorsTable
        operatorMap={operatorMap}
        isLoading={isLoading}
        onRestakeClicked={handleRestakeClicked}
      />
    </div>
  );
};

export default Page;
