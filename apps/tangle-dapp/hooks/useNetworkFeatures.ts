import { useMemo } from 'react';

import { NETWORK_FEATURE_MAP } from '../constants/networks';
import useNetworkStore from '../context/useNetworkStore';
import { NetworkFeature } from '../types';

// TODO: This should be adjusted with the following assumption in mind: There will only be 3 networks at most, and most features will be gate-kept (omitted) from mainnet specifically.
const useNetworkFeatures = (): Readonly<NetworkFeature[]> => {
  const { network } = useNetworkStore();

  return useMemo(() => NETWORK_FEATURE_MAP[network.name] ?? [], [network.name]);
};

export default useNetworkFeatures;
