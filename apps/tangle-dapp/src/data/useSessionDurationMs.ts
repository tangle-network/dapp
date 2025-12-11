import { useProtocolConfig } from '@tangle-network/tangle-shared-ui/data/graphql';
import { useMemo } from 'react';

/**
 * Hook to get session/round duration in milliseconds using EVM protocol config.
 */
const useSessionDurationMs = (): number | null => {
  const { data: config, isLoading } = useProtocolConfig();

  return useMemo(() => {
    if (!config || isLoading) {
      return null;
    }

    // roundDuration is in seconds from the contract
    return Number(config.roundDuration) * 1000;
  }, [config, isLoading]);
};

export default useSessionDurationMs;
