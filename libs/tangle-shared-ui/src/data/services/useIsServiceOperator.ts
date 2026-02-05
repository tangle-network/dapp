/**
 * Hook for checking if an address is an operator for a service.
 */

import { useMemo } from 'react';
import { Address } from 'viem';
import { useServiceOperators, UseServiceOperatorsOptions } from './useServiceOperators';

export interface UseIsServiceOperatorOptions extends UseServiceOperatorsOptions {}

/**
 * Hook to check if an address is an operator for a service.
 * Derives this from the useServiceOperators hook.
 *
 * @param serviceId - The service ID
 * @param operator - The address to check
 * @param options - Configuration options
 */
export const useIsServiceOperator = (
  serviceId: bigint | undefined,
  operator: Address | undefined,
  options?: UseIsServiceOperatorOptions,
) => {
  const { data: operators, isLoading, error, refetch } = useServiceOperators(
    serviceId,
    options,
  );

  const isOperator = useMemo(() => {
    if (!operators || !operator) {
      return false;
    }

    return operators.some(
      (op) => op.toLowerCase() === operator.toLowerCase(),
    );
  }, [operators, operator]);

  return {
    data: isOperator,
    isLoading,
    error,
    refetch,
  };
};

export default useIsServiceOperator;
