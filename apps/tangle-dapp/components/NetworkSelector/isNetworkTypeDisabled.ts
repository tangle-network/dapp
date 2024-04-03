import {
  NetworkType,
  WEBB_NETWORKS,
} from '@webb-tools/webb-ui-components/constants';

const isNetworkTypeDisabled = (networkType: NetworkType) => {
  const entry = WEBB_NETWORKS.find(
    (network) => network.networkType === networkType
  );

  // No entry for the given network type. This might be because
  // of a logic error.
  if (entry === undefined) {
    console.warn(
      `No entry for network type: ${networkType} exists on constants, but listed as a possible network type.`
    );

    return true;
  }

  // Disable the radio item if there are no networks for
  // the given network type.
  return entry.networks.length === 0;
};

export default isNetworkTypeDisabled;
