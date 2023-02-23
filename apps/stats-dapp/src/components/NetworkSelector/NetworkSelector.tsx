import { FC, useState } from 'react';
import {
  NetworkType,
  Network,
  webbNetworks,
} from '@webb-tools/webb-ui-components/constants';
import { RadioGroup, RadioItem } from '@webb-tools/webb-ui-components';
import { TangleLogo } from '@webb-tools/logos';

type NetworkSelectorProps = {
  selectedNetwork: Network;
  setUserSelectedNetwork: (network: Network) => void;
};

export const NetworkSelector: FC<NetworkSelectorProps> = ({
  selectedNetwork,
  setUserSelectedNetwork,
}) => {
  const networkTypes = ['live', 'testnet', 'dev'];

  const [selectedNetworkType, setSelectedNetworkType] =
    useState<NetworkType>('testnet');

  const filteredNetworkType = webbNetworks.filter(
    (network) => network.networkType === selectedNetworkType
  );

  return (
    <div>
      <RadioGroup
        defaultValue={selectedNetwork.name}
        value={selectedNetwork.name}
        onValueChange={(val) => {
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
              {selectedNetworkType !== 'dev' && <TangleLogo size="lg" />}
            </div>
          ))}
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
