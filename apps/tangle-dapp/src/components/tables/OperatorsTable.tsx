import { FC, useMemo } from 'react';
import { Button } from '@tangle-network/ui-components';
import type { Address } from 'viem';
import { useAccount } from 'wagmi';
import type { Operator } from '@tangle-network/tangle-shared-ui/data/graphql/useOperators';
import SharedOperatorsTable from '@tangle-network/tangle-shared-ui/components/tables/Operators';
import type { RestakeOperator } from '@tangle-network/tangle-shared-ui/types/restake';
import { TableVariant } from '@tangle-network/ui-components/components/Table/types';
import { useCanDelegateToOperators } from '@tangle-network/tangle-shared-ui/data/restake/useCanDelegateToOperators';

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
  const { address: userAddress } = useAccount();

  // Get operator addresses for batch delegation check
  const operatorAddresses = useMemo<Address[]>(() => {
    if (!operatorMap) return [];
    return Array.from(operatorMap.keys());
  }, [operatorMap]);

  // Check if user can delegate to each operator
  const { delegationInfo } = useCanDelegateToOperators({
    operators: operatorAddresses,
    delegator: userAddress,
    enabled: !!userAddress && operatorAddresses.length > 0,
  });

  const data = useMemo<RestakeOperator[]>(() => {
    if (!operatorMap) return [];

    return Array.from(operatorMap.values()).map((operator) => {
      // Normalize address to lowercase for consistent Map lookup
      const info = delegationInfo.get(operator.id.toLowerCase() as Address);
      return {
        address: operator.id,
        identityName: undefined,
        concentrationPercentage: null,
        restakersCount: formatDelegationCount(
          operator.restakingDelegationCount,
        ),
        selfBondedAmount: operator.restakingStake ?? BigInt(0),
        tvlInUsd: null,
        vaultTokens: [],
        isDelegated: false,
        instanceCount: 0,
        delegationMode: operator.delegationMode,
        canDelegate: info?.canDelegate,
      };
    });
  }, [operatorMap, delegationInfo]);

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
