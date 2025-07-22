import { useCallback, useMemo } from 'react';
import { of } from 'rxjs';
import useApiRx from '../../hooks/useApiRx';
import { MonitoringBlueprint } from './utils/type';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';

/**
 * Hook to fetch stopped/terminated service instances.
 *
 * Currently returns empty data as terminated instances are not stored in current chain state.
 * TODO: Implement GraphQL integration to fetch historical stopped instances.
 *
 * @param operatorAddress - The operator's address to filter stopped instances
 * @returns Stopped instances data, loading state, and error state
 */
const useStoppedInstances = (operatorAddress?: SubstrateAddress | null) => {
  const { result, ...rest } = useApiRx(
    useCallback(
      (_apiRx) => {
        // TODO: Replace with GraphQL query to fetch historical stopped instances
        // Currently returning empty array as stopped instances are not available in chain state
        if (!operatorAddress) {
          return of<MonitoringBlueprint['services']>([]);
        }

        // For now, return empty data
        // In the future, this will be replaced with:
        // return graphqlClient.query({
        //   query: GET_STOPPED_INSTANCES,
        //   variables: { operatorAddress }
        // })

        return of<MonitoringBlueprint['services']>([]);
      },
      [operatorAddress],
    ),
  );

  const stoppedInstances = useMemo(() => {
    return result ?? [];
  }, [result]);

  const isEmpty = stoppedInstances.length === 0;

  return {
    result: stoppedInstances,
    isEmpty,
    ...rest,
  };
};

export default useStoppedInstances;
