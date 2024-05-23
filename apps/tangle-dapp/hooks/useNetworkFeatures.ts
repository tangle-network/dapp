import { useMemo } from 'react';

import { NETWORK_FEATURE_MAP } from '../constants/networks';
import useNetworkStore from '../context/useNetworkStore';
import { NetworkFeature } from '../types';

const useNetworkFeatures = (): Readonly<NetworkFeature[]> => {
  const { network } = useNetworkStore();

  return useMemo(() => NETWORK_FEATURE_MAP[network.id], [network.id]);
};

export default useNetworkFeatures;
