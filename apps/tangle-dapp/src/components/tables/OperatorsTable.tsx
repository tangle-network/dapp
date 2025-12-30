import { FC, useMemo } from 'react';
import { Button } from '@tangle-network/ui-components';
import type { Address } from 'viem';
import type { Operator } from '@tangle-network/tangle-shared-ui/data/graphql/useOperators';
import SharedOperatorsTable from '@tangle-network/tangle-shared-ui/components/tables/Operators';
import type { RestakeOperator } from '@tangle-network/tangle-shared-ui/types/restake';
import { TableVariant } from '@tangle-network/ui-components/components/Table/types';

interface Props {
  operatorMap: Map<Address, Operator> | null;
  isLoading: boolean;
  onDelegateClicked: (operatorAddress: Address) => void;
}

const formatDelegationCount = (count: bigint | null | undefined): number => {
  if (!count) return 0;
  return Number(count);
};

export const OperatorsTable: FC<Props> = ({
  operatorMap,
  isLoading,
  onDelegateClicked,
}) => {
  const data = useMemo<RestakeOperator[]>(() => {
    if (!operatorMap) return [];

    return Array.from(operatorMap.values()).map((operator) => ({
      address: operator.id,
      identityName: undefined,
      concentrationPercentage: null,
      restakersCount: formatDelegationCount(operator.restakingDelegationCount),
      selfBondedAmount: operator.restakingStake ?? BigInt(0),
      tvlInUsd: null,
      vaultTokens: [],
      isDelegated: false,
      instanceCount: 0,
    }));
  }, [operatorMap]);

  return (
    <SharedOperatorsTable
      data={data}
      isLoading={isLoading}
      loadingTableProps={{
        title: 'Loading Operators',
        description: 'Fetching operators from the network…',
      }}
      emptyTableProps={{
        title: 'No Operators Available',
        description: 'Be the first to register as a restaking operator.',
      }}
      tableProps={{
        variant: TableVariant.GLASS_OUTER,
      }}
      RestakeOperatorAction={({ address }) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            onDelegateClicked(address as Address);
          }}
          className="min-w-24"
        >
          Delegate
        </Button>
      )}
    />
  );
};

export default OperatorsTable;
