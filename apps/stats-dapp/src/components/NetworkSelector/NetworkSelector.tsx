import { FC, useState } from 'react';
import {
  NetworkType,
  Network,
  webbNetworks,
} from '@webb-tools/webb-ui-components/constants';
import {
  Input,
  RadioGroup,
  RadioItem,
  TitleWithInfo,
} from '@webb-tools/webb-ui-components';
import { TangleLogo } from '@webb-tools/logos';
import {
  DeleteBinIcon,
  DeleteBinWithBg,
  Save,
  SaveFill,
  SaveWithBg,
} from '@webb-tools/icons';

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
          // TODO: Work in progress for custom network selection and local endpoint selection (not yet implemented)
          // TODO: Need to handle error if local endpoint is selected but no local endpoint is running
          // TODO: Need to use verifyEndpoint() to verify the custom network endpoint provided by the user
          // TODO: Need to create a new NETWORK type for custom network selection using the custom input fields and set it to the userSelectedNetwork
          if (val === 'Local endpoint' || val === 'Custom') {
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
              {selectedNetworkType !== 'dev' && <TangleLogo size="lg" />}
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

// https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:9944#/explorer
