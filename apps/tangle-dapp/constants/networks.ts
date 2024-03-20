import { webbNetworks } from '@webb-tools/webb-ui-components/constants';
import assert from 'assert';

// Use the testnet as the default network.
const DEFAULT_NETWORK_DEF = webbNetworks.find(
  (network) => network.networkType === 'testnet'
);

assert(
  DEFAULT_NETWORK_DEF !== undefined,
  'Default network definition should exist'
);

export const DEFAULT_NETWORK = (() => {
  const firstNetwork = DEFAULT_NETWORK_DEF.networks.at(0);

  assert(firstNetwork !== undefined, 'Default network should exist');

  return firstNetwork;
})();

export const ALL_WEBB_NETWORKS = webbNetworks.flatMap(
  (network) => network.networks
);

export const LIVE_AND_TEST_NETWORKS = ALL_WEBB_NETWORKS.filter(
  (network) =>
    network.networkType === 'live' || network.networkType === 'testnet'
);

export const DEV_NETWORKS = ALL_WEBB_NETWORKS.filter(
  (network) => network.networkType === 'dev'
);
