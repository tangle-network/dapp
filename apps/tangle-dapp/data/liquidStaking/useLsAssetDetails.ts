import { useCallback, useMemo } from 'react';

import useApiRx from '../../hooks/useApiRx';

const useLsAssetDetails = () => {
  const { result: tangleAssetDetails } = useApiRx(
    useCallback((api) => {
      return api.query.assets.asset.entries();
    }, []),
  );

  const keyValuePairs = useMemo(() => {
    if (tangleAssetDetails === null) {
      return null;
    }

    return tangleAssetDetails.flatMap(([poolIdKey, valueOpt]) => {
      // Ignore empty values.
      if (valueOpt.isNone) {
        return [];
      }

      // TODO: The key's type is u128, yet when creating pools, it uses u32 for the pool id. Is this a Tangle bug, or is there a reason for this? For now, assuming that all keys are max u32.
      return [[poolIdKey.args[0].toNumber(), valueOpt.unwrap()]] as const;
    });
  }, [tangleAssetDetails]);

  const map = useMemo(() => {
    if (keyValuePairs === null) {
      return null;
    }

    return new Map(keyValuePairs);
  }, [keyValuePairs]);

  return map;
};

export default useLsAssetDetails;
