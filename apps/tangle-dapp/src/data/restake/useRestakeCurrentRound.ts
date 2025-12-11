import { useProtocolConfig } from '@tangle-network/tangle-shared-ui/data/graphql';
import { useMemo } from 'react';

const useRestakeCurrentRound = () => {
  const { data: config, isLoading, error } = useProtocolConfig();

  const result = useMemo(() => {
    if (!config) {
      return null;
    }

    return Number(config.currentRound);
  }, [config]);

  return { result, isLoading, error };
};

export default useRestakeCurrentRound;
