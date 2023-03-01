import { FC, useEffect, useState } from 'react';
import {
  NetworkType,
  Network,
  webbNetworks,
} from '@webb-tools/webb-ui-components/constants';
import {
  Input,
  useWebbUI,
  RadioGroup,
  RadioItem,
  IconWithTooltip,
} from '@webb-tools/webb-ui-components';
import { InformationLine, TangleIcon } from '@webb-tools/icons';
import { Save, SaveWithBg, DeleteBinWithBg } from '@webb-tools/icons';
import { isValidSubqueryEndpoint, isValidPolkadotEndpoint } from '../../utils';

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
  const { notificationApi } = useWebbUI();

  const networkTypes = ['live', 'testnet', 'dev'];

  const [savedEnpoints, setSavedEnpoints] = useState({
    customSubqueryEndpoint:
      localStorage.getItem('customSubqueryEndpoint') ?? '',
    customPolkadotEndpoint:
      localStorage.getItem('customPolkadotEndpoint') ?? '',
  });

  const [customSubqueryEndpoint, setCustomSubqueryEndpoint] = useState(
    savedEnpoints.customSubqueryEndpoint ?? ''
  );

  const [customPolkadotEndpoint, setCustomPolkadotEndpoint] = useState(
    savedEnpoints.customPolkadotEndpoint ?? ''
  );

  const [customSubqueryEndpointIsValid, setCustomSubqueryEndpointIsValid] =
    useState(true);

  const [customPolkadotEndpointIsValid, setCustomPolkadotEndpointIsValid] =
    useState(true);

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

  const setDefaultEndpointsAsUserSelected = () => {
    if (
      selectedNetwork.name === 'Custom Network' &&
      localStorage.getItem('customSubqueryEndpoint') &&
      localStorage.getItem('customPolkadotEndpoint')
    ) {
      const defaultNetworkType = webbNetworks.filter(
        (network) => network.networkType === 'testnet'
      );

      setUserSelectedNetwork(defaultNetworkType[0].networks[0]);
      setSelectedNetworkType('testnet');
    }
  };

  return (
    <div>
      <RadioGroup
        defaultValue={selectedNetwork.name}
        value={selectedNetwork.name}
        onValueChange={(val) => {
          if (val === 'Custom Network') {
            setCustomEndpointsAsUserSelected();
            return;
          }

          const network = filteredNetworkType[0].networks.filter(
            (network) => network.name === val
          );

          setUserSelectedNetwork(network[0] as Network);
        }}
        className="pb-4"
      >
        <div className="flex flex-col space-y-4">
          {filteredNetworkType[0].networks.map((network) => (
            <div
              key={network.name}
              className="flex items-center justify-between"
            >
              <RadioItem id={network.name} value={network.name}>
                {network.name}
              </RadioItem>
              {selectedNetworkType !== 'dev' && <TangleIcon size="lg" />}
            </div>
          ))}

          {selectedNetworkType === 'dev' && (
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RadioItem id="Custom Network" value="Custom Network">
                    Custom Network
                  </RadioItem>
                  <IconWithTooltip
                    icon={<InformationLine />}
                    content={
                      <span className="text-sm">
                        Example endpoints:
                        <br />
                        Subquery: http://localhost:4000/graphql
                        <br />
                        Polkadot: ws://127.0.0.1:9944
                      </span>
                    }
                  />
                </div>
                {selectedNetworkType !== 'dev' && <TangleIcon size="lg" />}
              </div>

              <div className="flex flex-col space-y-2.5 pt-3">
                <Input
                  id="Subquery endpoint"
                  placeholder="Subquery endpoint"
                  errorMessage={
                    !customSubqueryEndpointIsValid ? 'Invalid endpoint' : ''
                  }
                  isInvalid={!customSubqueryEndpointIsValid}
                  value={customSubqueryEndpoint}
                  onChange={(val) => {
                    setCustomSubqueryEndpoint(val);
                  }}
                  rightIcon={
                    savedEnpoints.customSubqueryEndpoint ? (
                      <DeleteBinWithBg
                        size="lg"
                        onClick={() => {
                          setDefaultEndpointsAsUserSelected();
                          localStorage.removeItem('customSubqueryEndpoint');
                          setSavedEnpoints({
                            ...savedEnpoints,
                            customSubqueryEndpoint: '',
                          });
                          setCustomSubqueryEndpoint('');
                        }}
                      />
                    ) : customSubqueryEndpoint ? (
                      <SaveWithBg
                        size="lg"
                        onClick={async () => {
                          if (
                            await isValidSubqueryEndpoint(
                              customSubqueryEndpoint
                            )
                          ) {
                            localStorage.setItem(
                              'customSubqueryEndpoint',
                              customSubqueryEndpoint
                            );
                            setSavedEnpoints({
                              ...savedEnpoints,
                              customSubqueryEndpoint,
                            });
                            setCustomSubqueryEndpointIsValid(true);
                          } else {
                            localStorage.setItem('customSubqueryEndpoint', '');
                            setCustomSubqueryEndpointIsValid(false);
                          }
                        }}
                      />
                    ) : (
                      <Save size="lg" className="pointer-events-none" />
                    )
                  }
                />
                <Input
                  id="Polkadot endpoint"
                  placeholder="Polkadot endpoint"
                  errorMessage={
                    !customPolkadotEndpointIsValid ? 'Invalid endpoint' : ''
                  }
                  isInvalid={!customPolkadotEndpointIsValid}
                  value={customPolkadotEndpoint}
                  onChange={(val) => {
                    setCustomPolkadotEndpoint(val);
                  }}
                  rightIcon={
                    savedEnpoints.customPolkadotEndpoint ? (
                      <DeleteBinWithBg
                        size="lg"
                        onClick={() => {
                          setDefaultEndpointsAsUserSelected();
                          localStorage.removeItem('customPolkadotEndpoint');
                          setSavedEnpoints({
                            ...savedEnpoints,
                            customPolkadotEndpoint: '',
                          });
                          setCustomPolkadotEndpoint('');
                        }}
                      />
                    ) : customPolkadotEndpoint ? (
                      <SaveWithBg
                        size="lg"
                        onClick={async () => {
                          if (
                            await isValidPolkadotEndpoint(
                              customPolkadotEndpoint
                            )
                          ) {
                            localStorage.setItem(
                              'customPolkadotEndpoint',
                              customPolkadotEndpoint
                            );
                            setSavedEnpoints({
                              ...savedEnpoints,
                              customPolkadotEndpoint,
                            });
                            setCustomPolkadotEndpointIsValid(true);
                          } else {
                            localStorage.setItem('customPolkadotEndpoint', '');
                            setCustomPolkadotEndpointIsValid(false);
                          }
                        }}
                      />
                    ) : (
                      <Save size="lg" className="pointer-events-none" />
                    )
                  }
                />
              </div>
            </div>
          )}
        </div>
      </RadioGroup>

      <RadioGroup
        defaultValue={selectedNetworkType}
        value={selectedNetworkType}
        onValueChange={(val) => setSelectedNetworkType(val as NetworkType)}
        className="pb-2 border-t border-mono-40 dark:border-mono-140"
      >
        <div className="mt-4 flex items-center justify-between">
          {networkTypes.map((networkType) => (
            <RadioItem
              key={networkType}
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
