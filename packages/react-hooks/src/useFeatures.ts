import { useApi, useSetting } from '@webb-dapp/react-hooks';
import { AppFeatures } from '@webb-dapp/ui-components/types';
import { useMemo } from 'react';

export const useFeatures = (features: AppFeatures[]): boolean => {
  /*
  const selectedEndpoint = useMemo(
    () =>
      Object.values(selectableEndpoints)
        .flat()
        .find(
          (endpoint) => String(endpoint.name).toLocaleLowerCase() === String(chainInfo.chainName).toLocaleLowerCase()
        ),
    [, selectableEndpoints]
  );
  if (!selectedEndpoint) {
    return false;
  }
  return features.reduce((acc: boolean, reqFeat) => {
    return acc && selectedEndpoint.features[reqFeat];
  }, true);
*/
  return true;
};
