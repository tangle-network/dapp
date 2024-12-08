import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';

import { NETWORK_FEATURE_MAP } from '../constants/networks';
import { NetworkFeature } from '../types';

const useNetworkFeatures = (): Readonly<NetworkFeature[]> => {
  const { network } = useNetworkStore();

  return NETWORK_FEATURE_MAP[network.id];
};

export default useNetworkFeatures;
