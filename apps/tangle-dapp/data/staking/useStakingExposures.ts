import { useCallback } from 'react';

import useApiRx from '../../hooks/useApiRx';
import useEntryMap from '../../hooks/useEntryMap';
import useCurrentEra from './useCurrentEra';

const useStakingExposures = () => {
  // TODO: Also consider error from this hook.
  const { result: currentEra } = useCurrentEra();

  const { result: exposures, ...other } = useApiRx(
    useCallback(
      (api) => {
        if (currentEra === null) {
          return null;
        }

        return api.query.staking.erasStakersOverview.entries(currentEra);
      },
      [currentEra]
    )
  );

  const exposureMap = useEntryMap(
    exposures,
    useCallback((key) => key.args[0].toString(), [])
  );

  return { result: exposureMap, ...other };
};

export default useStakingExposures;
