import { NETWORK_FEATURE_MAP } from '../constants/networks';
import useNetworkStore from '../context/useNetworkStore';
import { NetworkFeature } from '../types';

const useNetworkFeatures = (): Readonly<NetworkFeature[]> => {
  const { network } = useNetworkStore();
  const features = NETWORK_FEATURE_MAP[network.name];

  return features ?? [];
};

export default useNetworkFeatures;
