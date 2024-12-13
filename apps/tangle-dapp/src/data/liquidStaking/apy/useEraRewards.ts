import useApiRx from '@webb-tools/tangle-shared-ui/hooks/useApiRx';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import assertSubstrateAddress from '@webb-tools/webb-ui-components/utils/assertSubstrateAddress';
import { useCallback, useMemo } from 'react';

import useActiveEraIndex from './useActiveEraIndex';

export type EraRewardPointsEntry = {
  total: number;
  individual: Map<SubstrateAddress, number>;
};

/**
 * Fetch the total and individual reward points for all the
 * eras up to max depth.
 */
const useEraRewardPoints = (): Map<number, EraRewardPointsEntry> | null => {
  const activeEraIndex = useActiveEraIndex();

  const { result: activeEraRewardPoints } = useApiRx(
    useCallback(
      (api) => {
        if (activeEraIndex === null) {
          return null;
        }

        return api.query.staking.erasRewardPoints.entries();
      },
      [activeEraIndex],
    ),
  );

  const keyValuePairs = useMemo(() => {
    if (activeEraRewardPoints === null) {
      return null;
    }

    return activeEraRewardPoints.map(([key, value]) => {
      const individualKeyValuePairs = Array.from(
        value.individual.entries(),
      ).map(([key, value]) => {
        return [
          assertSubstrateAddress(key.toString()),
          value.toNumber(),
        ] as const;
      });

      const individualPointsMap = new Map<SubstrateAddress, number>(
        individualKeyValuePairs,
      );

      const entry: EraRewardPointsEntry = {
        total: value.total.toNumber(),
        individual: individualPointsMap,
      };

      return [key.args[0].toNumber(), entry] as const;
    });
  }, [activeEraRewardPoints]);

  const map = useMemo(() => {
    if (keyValuePairs === null) {
      return null;
    }

    return new Map(keyValuePairs);
  }, [keyValuePairs]);

  return map;
};

export default useEraRewardPoints;
