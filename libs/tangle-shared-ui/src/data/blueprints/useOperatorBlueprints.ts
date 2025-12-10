import type { Address } from 'viem';
import { OperatorBlueprint } from './utils/type';

/**
 * Hook to get blueprints for an operator.
 * Currently returns empty array as blueprint data is not yet available from EVM.
 */
const useOperatorBlueprints = (_operatorAddress?: Address) => {
  // TODO: Implement EVM-based blueprint fetching when available
  return {
    blueprints: [] as OperatorBlueprint[],
    isLoading: false,
    error: null,
  };
};

export default useOperatorBlueprints;
