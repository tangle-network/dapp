import { useCallback, useMemo } from 'react';
import useApi from '@tangle-network/tangle-shared-ui/hooks/useApi';
import { BN } from '@polkadot/util';

const useSessionDurationMs = () => {
  const { result: epochDuration } = useApi(
    useCallback((api) => api.consts.babe.epochDuration, []),
  );

  const { result: babeExpectedBlockTime } = useApi(
    useCallback((api) => api.consts.babe.expectedBlockTime, []),
  );

  const sessionTimeMs = useMemo(() => {
    if (epochDuration == null || babeExpectedBlockTime === null) {
      return null;
    }

    return new BN(epochDuration).mul(new BN(babeExpectedBlockTime)).toNumber();
  }, [babeExpectedBlockTime, epochDuration]);

  return sessionTimeMs;
};

export default useSessionDurationMs;
