import { u8aToString } from '@polkadot/util';
import { useCallback, useMemo } from 'react';

import useApiRx from '../../hooks/useApiRx';
import useNetworkFeatures from '../../hooks/useNetworkFeatures';
import { NetworkFeature } from '../../types';

const useLsPoolsMetadata = () => {
  const networkFeatures = useNetworkFeatures();
  const isSupported = networkFeatures.includes(NetworkFeature.LsPools);

  const { result: rawMetadataEntries } = useApiRx(
    useCallback(
      (api) => {
        if (!isSupported) {
          return null;
        }

        return api.query.lst.metadata.entries();
      },
      [isSupported],
    ),
  );

  const keyValuePairs = useMemo(() => {
    if (rawMetadataEntries === null) {
      return null;
    }

    return rawMetadataEntries.map(([key, value]) => {
      return [key.args[0].toNumber(), u8aToString(value)] as const;
    });
  }, [rawMetadataEntries]);

  const map = useMemo(() => {
    if (keyValuePairs === null) {
      return null;
    }

    return new Map(keyValuePairs);
  }, [keyValuePairs]);

  return map;
};

export default useLsPoolsMetadata;
