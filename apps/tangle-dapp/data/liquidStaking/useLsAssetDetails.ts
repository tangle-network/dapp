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

      // Ids larger than `u32::MAX` aren't expected, so it is safe to
      // convert to a number here.
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
