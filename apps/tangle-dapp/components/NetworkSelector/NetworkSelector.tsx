import { assert } from '@polkadot/util/assert';
import { TangleIcon } from '@webb-tools/icons';
import {
  RadioGroup,
  RadioItem,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import {
  Network,
  NetworkType,
  webbNetworks,
} from '@webb-tools/webb-ui-components/constants';
import { FC, useMemo, useState } from 'react';

import useRpcEndpointStore from '../../context/useRpcEndpointStore';
import CustomNetworkConfig from './CustomNetworkConfig';
import isNetworkTypeDisabled from './isNetworkTypeDisabled';
import testRpcEndpointConnection from './testRpcEndpointConnection';

const NETWORK_TYPES: NetworkType[] = ['live', 'testnet', 'dev'];

const DEFAULT_NETWORK_DEF = webbNetworks.find(
  (network) => network.networkType === 'testnet'
);

assert(
  DEFAULT_NETWORK_DEF !== undefined,
  'Default network definition should exist'
);

const DEFAULT_NETWORK = DEFAULT_NETWORK_DEF.networks.at(0);

assert(DEFAULT_NETWORK !== undefined, 'Default network should exist');

// TODO: Ideally, consider merging this with the `stats-dapp`'s usage, into a single component from the Webb UI library, and then re-use it in both places.
export const NetworkSelector: FC = () => {
  const [network, setNetwork] = useState<Network>(DEFAULT_NETWORK);
  const { notificationApi } = useWebbUI();
  const { rpcEndpoint } = useRpcEndpointStore();

  const [networkType, setNetworkType] = useState<NetworkType>(
    DEFAULT_NETWORK_DEF.networkType
  );

  const [selectedNetworkType, setSelectedNetworkType] =
    useState<NetworkType>('testnet');

  const setCustomNetwork = async () => {
    if (!(await testRpcEndpointConnection(rpcEndpoint))) {
      notificationApi({
        variant: 'error',
        message: `Unable to connect to the requested network: ${rpcEndpoint}`,
      });

      return;
    }

    const customNetwork: Network = {
      name: 'Custom Network',
      networkType: 'dev',
      networkNodeType: 'standalone',
      subqueryEndpoint: '',
      polkadotEndpoint: rpcEndpoint,
      polkadotExplorer: `https://polkadot.js.org/apps/?rpc=${rpcEndpoint}#/explorer`,
      avatar: '',
    };

    notificationApi({
      variant: 'success',
      message: `Connected to ${rpcEndpoint}`,
    });

    setNetwork(customNetwork);
  };

  const networksMatchingType = useMemo(
    () => webbNetworks.filter((network) => network.networkType === networkType),
    [networkType]
  );

  const handleNetworkChange = (networkName: string) => {
    if (networkName === 'Custom Network') {
      setCustomNetwork();

      return;
    }

    const network = networksMatchingType[0].networks.find(
      (network) => network.name === networkName
    );

    assert(
      network !== undefined,
      'There should an entry for all network names'
    );

    setNetwork(network);
  };

  return (
    <div className="p-4">
      {/* Options & configuration */}
      <RadioGroup
        className="pb-4"
        defaultValue={network.name}
        value={network.name}
        onValueChange={handleNetworkChange}
      >
        <div className="flex flex-col space-y-4">
          {networksMatchingType[0].networks.map((network) => (
            <div key={network.name} className="flex items-center gap-2">
              <RadioItem id={network.name} value={network.name}>
                {network.name}
              </RadioItem>

              {networkType !== 'dev' && <TangleIcon size="lg" />}
            </div>
          ))}

          {networkType === 'dev' && (
            <CustomNetworkConfig setCustomNetwork={setCustomNetwork} />
          )}
        </div>
      </RadioGroup>

      {/* Network type listing */}
      <RadioGroup
        defaultValue={networkType}
        value={networkType}
        onValueChange={(val) => setNetworkType(val as NetworkType)}
        className="pb-2 border-t border-mono-40 dark:border-mono-140"
      >
        <div className="mt-4 flex items-center justify-between">
          {NETWORK_TYPES.map((networkType) => (
            <RadioItem
              key={networkType}
              id={networkType}
              value={networkType}
              overrideRadixRadioItemProps={{
                disabled: isNetworkTypeDisabled(networkType),
              }}
            >
              {networkType}
            </RadioItem>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};
