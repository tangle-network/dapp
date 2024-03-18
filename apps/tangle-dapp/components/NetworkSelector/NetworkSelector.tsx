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
import { FC, useState } from 'react';

import DevNetworkConfig from './DevNetworkConfig';
import isNetworkTypeDisabled from './isNetworkTypeDisabled';

type NetworkSelectorProps = {
  selectedNetwork: Network;
  selectedNetworkType: NetworkType;
  setUserSelectedNetwork: (network: Network) => void;
  setSelectedNetworkType: (networkType: NetworkType) => void;
};

const NETWORK_TYPES: NetworkType[] = ['dev', 'live', 'testnet'];

// TODO: Ideally, consider merging this with the `stats-dapp`'s usage, into a single component from the Webb UI library, and then re-use it in both places.
export const NetworkSelector: FC<NetworkSelectorProps> = ({
  selectedNetwork,
  setUserSelectedNetwork,
  selectedNetworkType,
  setSelectedNetworkType,
}) => {
  const { notificationApi } = useWebbUI();

  const [savedEndpoints, setSavedEndpoints] = useState({
    customSubqueryEndpoint:
      localStorage.getItem('customSubqueryEndpoint') ?? '',
    customPolkadotEndpoint:
      localStorage.getItem('customPolkadotEndpoint') ?? '',
  });

  const [customSubqueryEndpoint, setCustomSubqueryEndpoint] = useState(
    savedEndpoints.customSubqueryEndpoint ?? ''
  );

  const [customPolkadotEndpoint, setCustomPolkadotEndpoint] = useState(
    savedEndpoints.customPolkadotEndpoint ?? ''
  );

  const filteredNetworkType = webbNetworks.filter(
    (network) => network.networkType === selectedNetworkType
  );

  const setCustomEndpointsAsUserSelected = () => {
    if (
      localStorage.getItem('customSubqueryEndpoint') &&
      localStorage.getItem('customPolkadotEndpoint')
    ) {
      const customNetwork = {
        name: 'Custom Network',
        networkType: 'dev',
        networkNodeType: 'standalone',
        subqueryEndpoint: customSubqueryEndpoint,
        polkadotEndpoint: customPolkadotEndpoint,
        polkadotExplorer: `https://polkadot.js.org/apps/?rpc=${customPolkadotEndpoint}#/explorer`,
        avatar: '',
      };

      setUserSelectedNetwork(customNetwork as Network);
    } else {
      notificationApi({
        variant: 'warning',
        message: 'Please enter valid endpoints',
      });
    }
  };

  const handleNetworkChange = (networkName: string) => {
    if (networkName === 'Custom Network') {
      setCustomEndpointsAsUserSelected();
      return;
    }

    const network = filteredNetworkType[0].networks.find(
      (network) => network.name === networkName
    );

    assert(
      network !== undefined,
      'There should an entry for all network names'
    );

    setUserSelectedNetwork(network);
  };

  return (
    <div className="p-4">
      {/* Options & configuration */}
      <RadioGroup
        className="pb-4"
        defaultValue={selectedNetwork.name}
        value={selectedNetwork.name}
        onValueChange={handleNetworkChange}
      >
        <div className="flex flex-col space-y-4">
          {filteredNetworkType[0].networks.map((network) => (
            <div key={network.name} className="flex items-center gap-2">
              <RadioItem id={network.name} value={network.name}>
                {network.name}
              </RadioItem>

              {selectedNetworkType !== 'dev' && <TangleIcon size="lg" />}
            </div>
          ))}

          {selectedNetworkType === 'dev' && (
            <DevNetworkConfig
              selectedNetwork={selectedNetwork}
              selectedNetworkType={selectedNetworkType}
              setUserSelectedNetwork={setUserSelectedNetwork}
              setSelectedNetworkType={setSelectedNetworkType}
            />
          )}
        </div>
      </RadioGroup>

      {/* Network type listing */}
      <RadioGroup
        defaultValue={selectedNetworkType}
        value={selectedNetworkType}
        onValueChange={(val) => setSelectedNetworkType(val as NetworkType)}
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
