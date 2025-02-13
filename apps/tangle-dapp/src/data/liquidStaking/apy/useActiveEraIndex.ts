import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import { useCallback, useMemo } from 'react';

const useActiveEraIndex = (): number | null => {
  const { result: activeEraOpt } = useApiRx(
    useCallback((api) => {
      return api.query.staking.activeEra();
    }, []),
  );

  const activeEraIndex = useMemo(() => {
    if (activeEraOpt === null || activeEraOpt.isNone) {
      return null;
    }

    return activeEraOpt.unwrap().index;
  }, [activeEraOpt]);

  return activeEraIndex?.toNumber() ?? null;
};

export default useActiveEraIndex;
