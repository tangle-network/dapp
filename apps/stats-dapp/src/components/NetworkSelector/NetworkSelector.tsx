import { FC, useEffect, useState } from 'react';
import {
  NetworkType,
  Network,
  webbNetworks,
} from '@webb-tools/webb-ui-components/constants';
import { Input, RadioGroup, RadioItem } from '@webb-tools/webb-ui-components';
import { TangleIcon } from '@webb-tools/icons';
import { Save } from '@webb-tools/icons';

type NetworkSelectorProps = {
  selectedNetwork: Network;
  setUserSelectedNetwork: (network: Network) => void;
  selectedNetworkType: NetworkType;
  setSelectedNetworkType: (networkType: NetworkType) => void;
};

export const NetworkSelector: FC<NetworkSelectorProps> = ({
  selectedNetwork,
  setUserSelectedNetwork,
  selectedNetworkType,
  setSelectedNetworkType,
}) => {
  const networkTypes = ['live', 'testnet', 'dev'];

  const filteredNetworkType = webbNetworks.filter(
    (network) => network.networkType === selectedNetworkType
  );

  const [localHostSelected, setLocalHostSelected] = useState(false);

  useEffect(() => {
    if (selectedNetwork.name === 'Local') {
      setLocalHostSelected(true);
    } else {
      setLocalHostSelected(false);
    }
  }, [localHostSelected]);

  return (
    <div>
      <RadioGroup
        defaultValue={selectedNetwork.name}
        value={selectedNetwork.name}
        onValueChange={(val) => {
          // TODO: Work in progress for custom network selection and local endpoint selection (not yet implemented)
          // TODO: Need to handle error if local endpoint is selected but no local endpoint is running
          // TODO: Need to use verifyEndpoint() to verify the custom network endpoint provided by the user
          // TODO: Need to create a new NETWORK type for custom network selection using the custom input fields and set it to the userSelectedNetwork

          // val == 'Local'

          // checkEndpoint(val);

          if (val === 'Custom') {
            return;
          }

          const network = filteredNetworkType[0].networks.filter(
            (network) => network.name === val
          );

          setUserSelectedNetwork(network[0] as Network);
        }}
        className="border-b border-mono-40 dark:border-mono-140 pb-4"
      >
        <div className="flex flex-col space-y-4">
          {filteredNetworkType[0].networks.map((network) => (
            <div className="flex items-center justify-between">
              <RadioItem id={network.name} value={network.name}>
                {network.name}
              </RadioItem>
              {selectedNetworkType !== 'dev' && <TangleIcon size="lg" />}
            </div>
          ))}
          {selectedNetworkType === 'dev' && (
            <div className="flex flex-col space-y-2.5">
              <RadioItem id="Custom" value="Custom">
                Custom
              </RadioItem>
              <Input
                id="Subquery endpoint"
                placeholder="Subquery endpoint"
                rightIcon={<Save />}
              />
              <Input
                id="Polkadot endpoint"
                placeholder="Polkadot endpoint"
                rightIcon={<Save />}
              />
            </div>
          )}
        </div>
      </RadioGroup>

      <RadioGroup
        defaultValue={selectedNetworkType}
        value={selectedNetworkType}
        onValueChange={(val) => setSelectedNetworkType(val as NetworkType)}
        className="pb-2"
      >
        <div className="mt-4 flex items-center justify-between">
          {networkTypes.map((networkType) => (
            <RadioItem
              id={networkType}
              value={networkType}
              overrideRadixRadioItemProps={{
                disabled:
                  webbNetworks.filter(
                    (network) => network.networkType === networkType
                  )[0].networks.length === 0,
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

const isLocalhostRunning = async (endpoint: string): Promise<boolean> => {
  try {
    await new Promise((resolve, reject) => {
      const ws = new WebSocket(endpoint);
      ws.addEventListener('open', resolve);
      ws.addEventListener('error', reject);
    });
    console.log('Endpoint is running');
    return true;
  } catch (error) {
    console.error('Endpoint is not running:', error);
    return false;
  }
};
